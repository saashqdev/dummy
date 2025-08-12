export const getActionAccess = {
  // roles actions
  getRolesAction: ['roles.read'],
  createRoleAction: ['roles.create'],
  updateRolePermissionsAction: ['roles.update'],
  deleteRoleAction: ['roles.delete'],

  // teams actions
  getTeamMembersAction: ['team.read'],
  getTenantAction: ['team.read'],
  updateUserTenantRolesAction: ['team.update'],
  removeUserFromTeamAction: ['team.delete'],
  generateInviteLinkAction: ['team.update'],
} as const

export type GetActionAccessMap = typeof getActionAccess
export type ActionName = keyof GetActionAccessMap
export type ActionPermission = GetActionAccessMap[ActionName][number]
