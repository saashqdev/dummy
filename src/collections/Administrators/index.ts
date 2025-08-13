import { authenticated } from '@/access/authenticated'

import type { CollectionConfig } from 'payload'

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
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  auth: true,
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
