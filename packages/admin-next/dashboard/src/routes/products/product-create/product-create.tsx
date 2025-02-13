import { RouteFocusModal } from "../../../components/route-modal"
import { ProductCreateForm } from "./components/product-create-form/product-create-form"
import { useStore } from "../../../hooks/api/store"
import { useSalesChannel } from "../../../hooks/api/sales-channels"

export const ProductCreate = () => {
  const { store } = useStore({
    fields: "default_sales_channel",
  })

  const { sales_channel, isPending } = useSalesChannel(
    store?.default_sales_channel_id,
    {
      enabled: !!store,
    }
  )

  const canDisplayForm = store && !isPending

  return (
    <RouteFocusModal>
      {canDisplayForm && <ProductCreateForm defaultChannel={sales_channel} />}
    </RouteFocusModal>
  )
}
