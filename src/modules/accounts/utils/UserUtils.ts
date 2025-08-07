const prefix = (user: any): string => {
  if (user) {
    if (user.first_name && user.last_name) {
      if (user.first_name.length > 0 && user.last_name.length > 0) {
        return (user.first_name[0] + user.last_name[0]).toUpperCase()
      } else if (user.first_name.length > 1) {
        return user.first_name.substring(0, 2).toUpperCase()
      } else if (user.email.length > 1) {
        return user.email.substring(0, 2).toUpperCase()
      }
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
  }
  return '--'
}

const profileName = (
  user: { first_name: string | null; last_name: string | null; email: string } | null | undefined,
): string => {
  if (user) {
    if (user.first_name && user.last_name) {
      return user.first_name + ' ' + user.last_name
    } else {
      return user.email
    }
  }
  return '--'
}

export default {
  prefix,
  profileName,
}
