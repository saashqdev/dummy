// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { env } from 'env'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'

import {
  app_configuration,
  checkout_session_status,
  credit,
  permission,
  role,
  role_permission,
  subscription_feature,
  subscription_price,
  subscription_product,
  subscription_usage_based_price,
  subscription_usage_based_tier,
  tenant,
  tenant_subscription,
  tenant_subscription_product,
  tenant_subscription_product_price,
  tenant_subscription_usage_record,
  tenant_user,
  tenant_user_invitation,
  user,
  user_registration_attempt,
  user_role,
} from '@/db/schema'
import {
  relations_tenant_user_invitation,
  relations_user,
  relations_tenant,
  relations_user_registration_attempt,
  relations_role_permission,
  relations_permission,
  relations_role,
  relations_user_role,
  relations_subscription_usage_based_price,
  relations_subscription_product,
  relations_usage_based_tier,
  relations_subscription_feature,
  relations_tenant_subscription_product_price,
  relations_tenant_subscription_product,
  relations_subscription_price,
  relations_tenant_subscription_usage_record,
  relations_credit,
  relations_tenant_subscription,
  relations_tenant_user,
} from '@/db/relations'

import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    beforeSchemaInit: [
      ({ schema, adapter }) => {
        return {
          ...adapter.schema,
          tables: {
            ...schema.tables,
            app_configuration,
            checkout_session_status,
            credit,
            permission,
            role,
            role_permission,
            subscription_feature,
            subscription_price,
            subscription_product,
            subscription_usage_based_price,
            subscription_usage_based_tier,
            tenant,
            tenant_subscription,
            tenant_subscription_product,
            tenant_subscription_product_price,
            tenant_subscription_usage_record,
            tenant_user,
            tenant_user_invitation,
            user,
            user_registration_attempt,
            user_role,
          } as Record<string, any>,
          enums: {
            ...schema.enums,
          },
          relations: {
            ...schema.relations,
            relations_tenant_user_invitation,
            relations_user,
            relations_tenant,
            relations_user_registration_attempt,
            relations_role_permission,
            relations_permission,
            relations_role,
            relations_user_role,
            relations_subscription_usage_based_price,
            relations_subscription_product,
            relations_usage_based_tier,
            relations_subscription_feature,
            relations_tenant_subscription_product_price,
            relations_tenant_subscription_product,
            relations_subscription_price,
            relations_tenant_subscription_usage_record,
            relations_credit,
            relations_tenant_subscription,
            relations_tenant_user,
          } as Record<string, any>,
        }
      },
    ],
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  i18n: {
    supportedLanguages: { en, es },
    fallbackLanguage: 'en',
  },
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
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
