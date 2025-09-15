import { Permission, UseSelectorProps } from "@/props/useSelectorProps";
import { useRouter } from "next/router";
import { type LiHTMLAttributes, JSX } from "react";
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import styled, { css } from 'styled-components'
import Link from "next/link";
import { Hidden } from "react-grid-system";
import Tooltip from "rc-tooltip";
const Ul = styled.ul`
  flex-grow: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  overflow-x: hidden;
`
interface LiProps extends LiHTMLAttributes<HTMLLIElement> {
  isactive: boolean
  activeicon: string
  idleicon: string
  disabled?: boolean
  visible?: boolean
}

const Li = styled.li.withConfig({
  shouldForwardProp: (prop) =>
    !['visible', 'isactive', 'activeicon', 'idleicon'].includes(prop)
}) <LiProps>`
  display: ${(props) => (props.visible === true ? 'block' : 'none')};
  margin: 10px 0px 0px 0px;
  padding: 0px 30px;
  height: 40px;
  border-radius: 10px;
  > a {
    font-size: 0.8em;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: #5e4630;
  }
  > a > img {
    margin-right: 30px;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    ${(props) => `content:url(${props.idleicon})`}
  }
  &:hover {
    cursor: pointer;
    background-color: #f3e4d5;
    > a {
      color: #c97a40
    }
    > a > img {
      ${(props) => `content:url(${props.activeicon})`};
    }
  }
  ${(props) =>
    props.isactive &&
    css`
      background-color: '#f3e4d5';
      > a {
        color: #5e4630;
      }
      > a > img {
        ${`content:url(${props.activeicon})`};
      }
    `}
  @media (max-width: 1024px) {
    text-align: center;
    padding: 10px 0px 10px 0px;
    a {
      font-size: 0.5em;
      display: flex;
      flex-direction: column;
    }
    > a > img {
      width: 15px;
      height: 15px;
      margin: 0px 0px 10px 0px;
      ${(props) => `content:url(${props.idleicon})`}
    }
  }
  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    padding: 10px 0px;

    > span {
      font-size: 0.5em;
    }
    a {
      height: 20px;
    }
    > a > img {
      width: 15px;
      height: 15px;
      margin: 0 auto;
      ${(props) => `content:url(${props.idleicon})`}
    }
  }
`

interface MenuItem {
  path: string
  name: string
  permission: string
  icon: string
}

interface User {
  user: {
    id: string,
    username: string,
    email: string,
    last_login: string
    permissions: Permission[],
    role: string
  }
}

const Menu = ({ user }: User): JSX.Element => {
  const router = useRouter()

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      permission: PermissionMenuMaster.DASHBOARD,
      icon: 'dashboard'
    },
    {
      path: '/product',
      name: 'Products',
      permission: PermissionMenuMaster.PRODUCT_MENU,
      icon: 'products'
    },
    {
      path: '/orders',
      name: 'Orders',
      permission: PermissionMenuMaster.ORDER_MANAGEMENT,
      icon: 'orders'
    },
    {
      path: '/customers',
      name: 'Customers',
      permission: PermissionMenuMaster.MANAGE_CUSTOMER,
      icon: 'orders'
    }
  ]

  return (
    <Ul>
      {menuItems.map(({ path, name, permission, icon }) => {
        const hasPermission = user?.permissions.find((perm: any) => {
          return perm.name === permission && perm.view === true
        })

        return (
          <Li
            key={path}
            isactive={router.pathname.includes(path)}
            activeicon={`/icons/menu/${icon}-active.svg`}
            idleicon={`/icons/menu/${icon}-active.svg`}
            visible={Boolean(hasPermission)}
          >
            <Link href={path}>
              <Hidden xs>
                <img alt={`${path}`} />
                <Hidden md sm>
                  <span> {name}</span>
                </Hidden>
              </Hidden>
            </Link>

            <Hidden xs lg xl xxl xxxl>
              <span>{name}</span>
            </Hidden>

            <Link href={path}>
              <Hidden sm md lg xl xxl xxxl>
                <Tooltip placement='right' trigger={['hover']} overlay={name}>
                  <img alt={`${path}`} />
                </Tooltip>
              </Hidden>
            </Link>
          </Li>
        )
      })}

    </Ul>
  )
}

export default Menu