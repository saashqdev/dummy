import { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Roles: CollectionConfig = {
  slug: 'roles',

  labels: {
    singular: 'Role',
    plural: 'Roles',
  },

  admin: {
    useAsTitle: 'name',
  },

  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      admin: {
        description: 'Enter the name of the role.',
        placeholder: 'Admin',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Enter description for the role.',
        placeholder: 'Admin',
      },
    },
    {
      name: 'role_type',
      type: 'text',
      label: 'Role Type',
      required: true,
    },
    {
      name: 'assign_to_new_users',
      type: 'checkbox',
      label: 'Assign to New Users',
      required: true,
    },
    {
      name: 'is_default',
      type: 'checkbox',
      label: 'Is Default',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      required: true,
    },
    {
      type: 'group',
      label: 'Roles',
      name: 'roles',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Team',
      name: 'team',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'select',
      name: 'type',
      options: [
        {
          label: 'Engineering',
          value: 'engineering',
        },
        {
          label: 'Management',
          value: 'management',
        },
        {
          label: 'Marketing',
          value: 'marketing',
        },
        {
          label: 'Finance',
          value: 'finance',
        },
        {
          label: 'Sales',
          value: 'sales',
        },
      ],
      defaultValue: 'marketing',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'relationship',
      name: 'createdUser',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'text',
      name: 'tags',
      label: 'Tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
