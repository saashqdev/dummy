import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { softDeletePlugin } from '@payload-bites/soft-delete'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { env } from 'env'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { Media } from './collections/Media'
import { Roles } from './collections/Roles'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { addBeforeOperationHook, softDeletePluginConfigCollections } from './soft-delete'
import { Paywalls } from './globals/(ecommerce)/Paywalls/config'
import { Administrators } from './collections/Administrators'
import { Branding } from './globals/Branding'
import { Theme } from './globals/Theme'

import {
  app_configuration,
  checkout_session_status,
  credit,
  subscription_feature,
  subscription_price,
  subscription_product,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  permission,
  role_permission,
  tenant_user_invitation,
  user_registration_attempt,
  tenant_user,
  tenant_subscription_product_price,
  tenant_subscription_usage_record,
  tenant_subscription_product,
  tenant_subscription,
  user_role,
  relations_subscription_usage_based_price,
  relations_subscription_product,
  relations_usage_based_tier,
  relations_subscription_feature,
  relations_subscription_price,
  relations_permission,
  relations_tenant_user_invitation,
  relations_user_registration_attempt,
  relations_tenant_user,
  relations_role_permission,
  relations_tenant_subscription_product_price,
  relations_tenant_subscription_usage_record,
  relations_tenant_subscription_product,
  relations_tenant_subscription,
  relations_user_role,
} from '@/db/schema'

import { PgTableWithColumns } from 'drizzle-orm/pg-core'

// Define GenericRelation type if not available from a package
type GenericRelation = any

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const collectionsWithHook = addBeforeOperationHook([Administrators, Users, Tenants, Roles, Media])

export default buildConfig({
  routes: {
    admin: '/payload-admin',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(dirname, 'app', '(payload)', 'payload-admin', 'importMap.js'),
    },
  },
  collections: [...collectionsWithHook],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    beforeSchemaInit: [
      ({ schema }) => {
        return {
          tables: {
            ...schema.tables,
            app_configuration,
            checkout_session_status,
            credit,
            subscription_feature,
            subscription_price,
            subscription_product,
            subscription_usage_based_price,
            subscription_usage_based_tier,
            permission,
            role_permission,
            tenant_user_invitation,
            user_registration_attempt,
            tenant_user,
            tenant_subscription_product_price,
            tenant_subscription_usage_record,
            tenant_subscription_product,
            tenant_subscription,
            user_role,
          } as Record<string, PgTableWithColumns<any> | GenericRelation>,
          enums: {
            ...schema.enums,
          },
          relations: {
            ...schema.relations,
            relations_subscription_usage_based_price,
            relations_subscription_product,
            relations_usage_based_tier,
            relations_subscription_feature,
            relations_subscription_price,
            relations_permission,
            relations_tenant_user_invitation,
            relations_user_registration_attempt,
            relations_tenant_user,
            relations_role_permission,
            relations_tenant_subscription_product_price,
            relations_tenant_subscription_usage_record,
            relations_tenant_subscription_product,
            relations_tenant_subscription,
            relations_user_role,
          } as Record<string, PgTableWithColumns<any> | GenericRelation>,
        }
      },
    ],
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  globals: [Paywalls, Branding, Theme],
  sharp,
  i18n: {
    supportedLanguages: { en, es },
    fallbackLanguage: 'en',
  },
  plugins: [
    multiTenantPlugin({
      collections: {
        roles: {},
      },
      userHasAccessToAllTenants: (user) =>
        'role' in user && Array.isArray((user as any).role)
          ? (user as any).role.includes('admin')
          : false,
      enabled: true,
      tenantsArrayField: {
        includeDefaultField: false,
      },
    }),
    softDeletePlugin({
      enabled: true,
      collections: softDeletePluginConfigCollections,
    }),
  ],
  ...(env?.RESEND_API_KEY &&
    env?.RESEND_SENDER_EMAIL &&
    env?.RESEND_SENDER_NAME && {
      email: resendAdapter({
        defaultFromAddress: env.RESEND_SENDER_EMAIL,
        defaultFromName: env.RESEND_SENDER_NAME,
        apiKey: env.RESEND_API_KEY,
      }),
    }),
})
