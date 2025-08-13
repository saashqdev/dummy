import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import { isAdmin } from '@/access/isAdmin'
import { ResetPassword } from '@/emails/reset-password'
import { env } from 'env'
import { handleUserRoles } from './hooks/handleUserRoles'

import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {
    //update access controls
    read: () => true,
    update: () => true,
    create: () => true,
  },
  tenantFieldAccess: {
    read: () => true,
    update: () => true,
    create: () => true,
  },
  rowFields: [
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: false,
      label: 'Tenant Role',
      required: true,
      filterOptions: ({ siblingData }: { siblingData: any }) => {
        const tenantId = siblingData?.tenant
        if (!tenantId) {
          return false
        }
        // Filter roles where 'tenant' field equals selected tenantId
        return {
          tenant: {
            equals: tenantId,
          },
        }
      },
    },
  ],
})

export const Administrators: CollectionConfig = {
  slug: 'administrators',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['username', 'email'],
    group: {
      en: 'Page Settings',
      pl: 'Ustawienia strony',
      ut: 'Users & Tenants',
    },
    components: {
      edit: {
        beforeDocumentControls: ['@/components/ImpersonateUser'],
      },
    },
  },
  access: {
    admin: ({ req }) => {
      const { user } = req

      if ('role' in (user || {}) && Array.isArray(user?.role) && user.role.includes('admin')) {
        return true
      }

      return false
    },
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    unlock: authenticated,
  },
  labels: {
    singular: {
      en: 'Administrator',
      pl: 'Administrator',
    },
    plural: {
      en: 'Administrators',
      pl: 'Administratorzy',
    },
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      generateEmailHTML: (args) => {
        return ResetPassword({
          actionLabel: 'Reset Your Password',
          buttonText: 'Reset Password',
          userName: args?.user.username,
          href: `${env.NEXT_PUBLIC_WEBSITE_URL}/reset-password?token=${args?.token}`,
        })
      },
    },
    useAPIKey: true,
  },
  hooks: {
    beforeChange: [handleUserRoles],
  },
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      saveToJWT: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'user', 'demo'],
      hasMany: true,
      saveToJWT: true,
      defaultValue: 'user',
    },
  ],
  timestamps: true,
}
