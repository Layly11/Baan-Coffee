export interface UseSelectorProps {
//   user: {
//     id: string
//     email: string
//     username: string
//   }

user: {
    id: string,
    username: string,
    email: string,
    permission: Permission[],
    role: string

}
}

export interface Permission {
  view: boolean
  name: string
  list: boolean
  detail: boolean
  create: boolean
  edit: boolean
  action1: boolean
  action2: boolean
  action3: boolean
  action4: boolean
  action5: boolean
}

