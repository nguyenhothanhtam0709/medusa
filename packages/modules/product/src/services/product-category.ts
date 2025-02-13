import { Context, DAL, FindConfig, ProductTypes } from "@medusajs/types"
import {
  FreeTextSearchFilterKey,
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaError,
  ModulesSdkUtils,
  isDefined,
} from "@medusajs/utils"
import { ProductCategory } from "@models"
import { ProductCategoryRepository } from "@repositories"
import { UpdateCategoryInput } from "@types"

type InjectedDependencies = {
  productCategoryRepository: DAL.TreeRepositoryService
}
export default class ProductCategoryService<
  TEntity extends ProductCategory = ProductCategory
> {
  protected readonly productCategoryRepository_: DAL.TreeRepositoryService

  constructor({ productCategoryRepository }: InjectedDependencies) {
    this.productCategoryRepository_ = productCategoryRepository
  }

  // TODO: Add support for object filter
  @InjectManager("productCategoryRepository_")
  async retrieve(
    productCategoryId: string,
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity> {
    if (!isDefined(productCategoryId)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"productCategoryId" must be defined`
      )
    }

    const queryOptions = ModulesSdkUtils.buildQuery<ProductCategory>(
      {
        id: productCategoryId,
      },
      config
    )

    // TODO: Currently remoteQuery doesn't allow passing custom objects, so the `include*` are part of the filters
    // Modify remoteQuery to allow passing custom objects
    const transformOptions = {
      includeDescendantsTree: true,
    }

    const productCategories = await this.productCategoryRepository_.find(
      queryOptions,
      transformOptions,
      sharedContext
    )

    if (!productCategories?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `ProductCategory with id: ${productCategoryId} was not found`
      )
    }

    return productCategories[0] as TEntity
  }

  @InjectManager("productCategoryRepository_")
  async list(
    filters: ProductTypes.FilterableProductCategoryProps = {},
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    const transformOptions = {
      includeDescendantsTree: filters?.include_descendants_tree || false,
      includeAncestorsTree: filters?.include_ancestors_tree || false,
    }
    delete filters.include_descendants_tree
    delete filters.include_ancestors_tree

    // Apply free text search filter
    if (filters?.q) {
      config.filters ??= {}
      config.filters[FreeTextSearchFilterKey] = {
        value: filters.q,
        fromEntity: ProductCategory.name,
      }

      delete filters.q
    }

    const queryOptions = ModulesSdkUtils.buildQuery<ProductCategory>(
      filters,
      config
    )
    queryOptions.where ??= {}

    return (await this.productCategoryRepository_.find(
      queryOptions,
      transformOptions,
      sharedContext
    )) as TEntity[]
  }

  @InjectManager("productCategoryRepository_")
  async listAndCount(
    filters: ProductTypes.FilterableProductCategoryProps = {},
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[TEntity[], number]> {
    const transformOptions = {
      includeDescendantsTree: filters?.include_descendants_tree || false,
      includeAncestorsTree: filters?.include_ancestors_tree || false,
    }
    delete filters.include_descendants_tree
    delete filters.include_ancestors_tree

    // Apply free text search filter
    if (filters?.q) {
      config.filters ??= {}
      config.filters[FreeTextSearchFilterKey] = {
        value: filters.q,
        fromEntity: ProductCategory.name,
      }

      delete filters.q
    }

    const queryOptions = ModulesSdkUtils.buildQuery<ProductCategory>(
      filters,
      config
    )
    queryOptions.where ??= {}

    return (await this.productCategoryRepository_.findAndCount(
      queryOptions,
      transformOptions,
      sharedContext
    )) as [TEntity[], number]
  }

  @InjectTransactionManager("productCategoryRepository_")
  async create(
    data: ProductTypes.CreateProductCategoryDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).create(data, sharedContext)) as TEntity[]
  }

  @InjectTransactionManager("productCategoryRepository_")
  async update(
    data: UpdateCategoryInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).update(data, sharedContext)) as TEntity[]
  }

  @InjectTransactionManager("productCategoryRepository_")
  async delete(
    ids: string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.productCategoryRepository_.delete(ids, sharedContext)
  }

  async softDelete(
    ids: string[],
    @MedusaContext() sharedContext?: Context
  ): Promise<Record<string, string[]> | void> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).softDelete(ids, sharedContext)) as any
  }

  async restore(
    ids: string[],
    @MedusaContext() sharedContext?: Context
  ): Promise<Record<string, string[]> | void> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).restore(ids, sharedContext)) as any
  }
}
