import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'first_name',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last Name',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
    },
    {
      name: 'avatar_url',
      type: 'text',
      label: 'Avatar URL',
    },
    {
      name: 'locale',
      type: 'text',
      label: 'Locale',
    },
    {
      name: 'default_tenant_id',
      type: 'text',
      label: 'Default Tenant ID',
    },
    {
      name: 'verify_token',
      type: 'text',
      label: 'Verify Token',
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: false,
    },
    {
      name: 'admin',
      type: 'checkbox',
      label: 'Admin',
      defaultValue: false,
    },
  ],
}
