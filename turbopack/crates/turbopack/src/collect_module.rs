use std::io::Write;

use anyhow::{Context, Result, bail};
use turbo_rcstr::{RcStr, rcstr};
use turbo_tasks::{FxIndexMap, ResolvedVc, TryJoinIterExt, Vc, turbobail};
use turbo_tasks_fs::{FileSystem, FileSystemPath, VirtualFileSystem, rope::RopeBuilder};
use turbopack_core::{
    self,
    chunk::{AsyncModuleInfo, ChunkItem, ChunkableModule, ChunkingContext},
    context::AssetContext,
    emit_collect::{CollectingModule, EmittedModuleReference},
    ident::AssetIdent,
    module::{Module, ModuleSideEffects, Modules, OptionModule},
    module_graph::ModuleGraph,
    reference::{ModuleReferences, SingleModuleReference},
    reference_type::ReferenceType,
    resolve::{ResolveErrorMode, origin::PlainResolveOrigin, parse::Request},
    source::{OptionSource, Source},
};
use turbopack_ecmascript::{
    EcmascriptInputTransforms,
    chunk::{
        EcmascriptChunkItemContent, EcmascriptChunkPlaceable, EcmascriptExports,
        ecmascript_chunk_item,
    },
    runtime_functions::{TURBOPACK_ESM, TURBOPACK_IMPORT},
    utils::StringifyJs,
};
use turbopack_resolve::ecmascript::cjs_resolve;

use crate::{ModuleAssetContext, module_options::CustomModuleType};

#[turbo_tasks::value]
pub struct CollectModuleType {}

#[turbo_tasks::value_impl]
impl CollectModuleType {
    #[turbo_tasks::function]
    pub fn new() -> Vc<Self> {
        CollectModuleType {}.cell()
    }
}

#[turbo_tasks::value_impl]
impl CustomModuleType for CollectModuleType {
    #[turbo_tasks::function]
    async fn create_module(
        self: turbo_tasks::Vc<Self>,
        _source: Vc<Box<dyn Source>>,
        asset_context: Vc<ModuleAssetContext>,
        reference_type: ReferenceType,
    ) -> Result<Vc<Box<dyn Module>>> {
        let ReferenceType::Collect {
            namespace,
            // TODO remove
            parent_module,
        } = reference_type
        else {
            bail!(
                "CollectModuleType only supports \
                 EcmaScriptModulesReferenceSubType::ImportWithTurbopackCollect"
            );
        };

        Ok(Vc::upcast(CollectModule::new(
            namespace,
            asset_context,
            parent_module
                .unwrap()
                .ident()
                .await?
                .path
                .root()
                .await?
                .join("_")?,
        )))
    }

    #[turbo_tasks::function]
    fn extend_ecmascript_transforms(
        self: Vc<Self>,
        _preprocess: Vc<EcmascriptInputTransforms>,
        _main: Vc<EcmascriptInputTransforms>,
        _postprocess: Vc<EcmascriptInputTransforms>,
    ) -> Result<Vc<Box<dyn CustomModuleType>>> {
        // TODO
        // bail!("CollectModuleType does not support ECMAScript transforms")
        Ok(Vc::upcast(self))
    }
}

#[turbo_tasks::value]
pub struct CollectModule {
    namespace: RcStr,
    asset_context: ResolvedVc<ModuleAssetContext>,
    root_path: FileSystemPath,
}

#[turbo_tasks::value_impl]
impl CollectModule {
    #[turbo_tasks::function]
    pub fn new(
        namespace: RcStr,
        asset_context: ResolvedVc<ModuleAssetContext>,
        root_path: FileSystemPath,
    ) -> Vc<Self> {
        CollectModule {
            namespace,
            asset_context,
            root_path,
        }
        .cell()
    }

    /// Resolve the `next/dist/server/app-render/work-async-storage.external` module
    /// so it can be imported via TURBOPACK_IMPORT in the generated JS code.
    #[turbo_tasks::function]
    async fn work_async_storage_module(&self) -> Result<Vc<OptionModule>> {
        if matches!(
            &**self.asset_context.await?.layer().name(),
            "client" | "app-client"
        ) {
            return Ok(Vc::cell(None));
        }

        let origin =
            PlainResolveOrigin::new(Vc::upcast(*self.asset_context), self.root_path.clone());

        let result = cjs_resolve(
            Vc::upcast(origin),
            Request::parse_string(rcstr!(
                "next/dist/server/app-render/work-async-storage.external"
            )),
            Default::default(),
            None,
            ResolveErrorMode::Error,
        )
        .await?;

        Ok(Vc::cell(Some(
            result
                .primary_modules_ref()
                .await?
                .first()
                .copied()
                .context("failed to resolve work-async-storage")?,
        )))
    }
}

/// Each entry point in the HMR system has an ident with a different nested asset.
/// This produces the 'base' ident for the HMR entry point, which is then modified
#[turbo_tasks::function]
fn virtual_fs() -> Vc<VirtualFileSystem> {
    VirtualFileSystem::new_with_name(rcstr!("turbopack-collect"))
}

#[turbo_tasks::value_impl]
impl Module for CollectModule {
    #[turbo_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        Ok(AssetIdent::from_path(virtual_fs().root().owned().await?)
            .with_layer(self.asset_context.await?.layer().clone())
            .with_modifier(self.namespace.clone()))
    }

    #[turbo_tasks::function]
    fn source(&self) -> Vc<OptionSource> {
        Vc::cell(None)
    }

    #[turbo_tasks::function]
    async fn references(self: Vc<Self>) -> Result<Vc<ModuleReferences>> {
        let module = self.work_async_storage_module().await?;
        if let Some(module) = &*module {
            Ok(Vc::cell(vec![ResolvedVc::upcast(
                SingleModuleReference::new(**module, rcstr!("work-async-storage"))
                    .to_resolved()
                    .await?,
            )]))
        } else {
            Ok(Vc::cell(vec![]))
        }
    }

    #[turbo_tasks::function]
    fn side_effects(self: Vc<Self>) -> Vc<ModuleSideEffects> {
        ModuleSideEffects::ModuleEvaluationIsSideEffectFree.cell()
    }
}

#[turbo_tasks::value_impl]
impl CollectingModule for CollectModule {
    #[turbo_tasks::function]
    fn namespace(&self) -> Vc<RcStr> {
        Vc::cell(self.namespace.clone())
    }

    #[turbo_tasks::function]
    fn as_chunk_item(
        self: ResolvedVc<Self>,
        module_graph: Vc<ModuleGraph>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
        chunk_group: ResolvedVc<Modules>,
    ) -> Vc<Box<dyn ChunkItem>> {
        CollectModuleWithChunkGroup {
            module: self,
            chunk_group,
        }
        .cell()
        .as_chunk_item(module_graph, chunking_context)
    }
}

#[turbo_tasks::value_impl]
impl ChunkableModule for CollectModule {
    #[turbo_tasks::function]
    fn as_chunk_item(
        self: Vc<Self>,
        _module_graph: Vc<ModuleGraph>,
        _chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<Box<dyn ChunkItem>>> {
        bail!("shouldn't be called, but needed for chunkable.chunk_item_id");
    }
}

#[turbo_tasks::value]
struct CollectModuleWithChunkGroup {
    module: ResolvedVc<CollectModule>,
    chunk_group: ResolvedVc<Modules>,
}

#[turbo_tasks::value_impl]
impl Module for CollectModuleWithChunkGroup {
    #[turbo_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.module.ident()
    }

    #[turbo_tasks::function]
    fn source(&self) -> Vc<OptionSource> {
        self.module.source()
    }

    #[turbo_tasks::function]
    fn references(&self) -> Vc<ModuleReferences> {
        self.module.references()
    }

    #[turbo_tasks::function]
    fn side_effects(&self) -> Vc<ModuleSideEffects> {
        self.module.side_effects()
    }
}

#[turbo_tasks::value_impl]
impl ChunkableModule for CollectModuleWithChunkGroup {
    #[turbo_tasks::function]
    fn as_chunk_item(
        self: ResolvedVc<Self>,
        module_graph: ResolvedVc<ModuleGraph>,
        chunking_context: ResolvedVc<Box<dyn ChunkingContext>>,
    ) -> Vc<Box<dyn ChunkItem>> {
        ecmascript_chunk_item(ResolvedVc::upcast(self), module_graph, chunking_context)
    }
}

#[turbo_tasks::value_impl]
impl EcmascriptChunkPlaceable for CollectModuleWithChunkGroup {
    #[turbo_tasks::function]
    fn get_exports(&self) -> Vc<EcmascriptExports> {
        EcmascriptExports::Value.cell()
    }

    #[turbo_tasks::function]
    async fn chunk_item_content(
        &self,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
        module_graph: Vc<ModuleGraph>,
        _async_module_info: Option<Vc<AsyncModuleInfo>>,
        _estimated: bool,
    ) -> Result<Vc<EcmascriptChunkItemContent>> {
        let chunk_item_id_strategy = chunking_context.chunk_item_id_strategy().await?;
        let chunk_group = self.chunk_group.await?;

        // This is ['[project]/packages/next/dist/esm/build/templates/app-page.js?page=/second/page
        // { MODULE_0 => "app/layout.js [app-rsc] (ecmascript, Next.js Server Component)", ...,
        // MODULE_5 => "app/second/page.js [app-rsc] (ecmascript, Next.js Server Component)" }
        // [app-rsc] (ecmascript)']
        // or
        // ["[project]/packages/next/dist/client/next-turbopack.js [client] (ecmascript)",
        // "[next]/entry/page-loader.ts { PAGE => \"[project]/bench/app-router-server/pages/index.js
        // [client] (ecmascript)\" } [client] (ecmascript)"]
        let entry = *chunk_group
            .last()
            .context("expected at least one module in chunk group")?;

        println!(
            "collect codegen, searching for {:?} {:#?}",
            self.module.ident_string().await?,
            entry.ident_string().await?
        );

        // TODO don't read whole graph
        let module_graph = module_graph.await?;
        let collect = module_graph.collected_modules.as_ref().unwrap();
        let items = collect
            .collected_references
            .iter()
            .find_map(|((page, collect), references)| {
                if *collect == ResolvedVc::upcast(self.module) && *page == entry {
                    Some(references.iter())
                } else {
                    None
                }
            })
            .into_iter()
            .flatten();

        let items = items
            .map(async |(data, module, _)| {
                Ok((
                    chunk_item_id_strategy.get_id_from_module(**module).await?,
                    if let Some(reference) =
                        ResolvedVc::try_sidecast::<Box<dyn EmittedModuleReference>>(data.reference)
                    {
                        Some(reference.data().await?)
                    } else {
                        None
                    },
                ))
            })
            .try_join()
            .await?
            .into_iter()
            .collect::<FxIndexMap<_, _>>();

        let entry_ident = entry.ident().await?;
        let Some(page) = (if entry_ident
            .path
            .path
            .ends_with("next/dist/esm/build/templates/middleware.js")
        {
            // TODO is this always the case for middleware?
            Some("/")
        } else {
            entry_ident.query.strip_prefix("?page=")
        }) else {
            turbobail!(
                "Expected entry module to have a 'page' query parameter: {:?}",
                entry.ident_string()
            );
        };

        let work_storage = if let Some(m) = &*self.module.work_async_storage_module().await? {
            Some(chunk_item_id_strategy.get_id_from_module(**m).await?)
        } else {
            None
        };

        let mut code = RopeBuilder::default();
        writeln!(code, "var data = {{ {}: [", StringifyJs(&page))?;
        for (id, data) in items {
            writeln!(
                code,
                "  {{id: {}, data: {}, import: () => {TURBOPACK_IMPORT}({})}},",
                StringifyJs(&id),
                StringifyJs(&data),
                StringifyJs(&id),
            )?;
        }
        writeln!(code, "]}};")?;

        code +=
            "function __turbopack__merge__(v) { if(!v) return data; Object.assign(data, v); }\n";

        if let Some(work_storage) = &work_storage {
            write!(
                code,
                "var workAsyncStorage = {TURBOPACK_IMPORT}({}).workAsyncStorage;",
                StringifyJs(work_storage)
            )?;
            // Node
            code += "function getList(){
    var store = workAsyncStorage.getStore();
    if(!store) throw new Error('__turbopack_collect__.getList() must only be called during \
                     rendering');
    return data[store.page];
}\n";
        } else {
            // Browser
            code += "function getList(){
    return data[window.next.__internal_src_page];
}\n";
        }

        writeln!(
            code,
            "{TURBOPACK_ESM}([
    '__turbopack__merge__', ()=>__turbopack__merge__,
    'getList', ()=>getList
]);"
        )?;

        Ok(EcmascriptChunkItemContent {
            inner_code: code.build(),
            mergeable: true,
            ..Default::default()
        }
        .cell())
    }
}
