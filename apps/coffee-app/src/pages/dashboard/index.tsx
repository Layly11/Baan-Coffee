import withAuthenticated from "@/hocs/withAuthenticated"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { useSelector } from "react-redux"

const DashBoardPage = () => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  return (
    <div>This is DashBoard Page {user?.email}</div>
  )
}

export default withAuthenticated(DashBoardPage)

