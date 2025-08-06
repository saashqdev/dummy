import { AppConfigurationModel } from "../../models/core/AppConfigurationModel";

export interface IAppConfigurationDb {
  get(): Promise<AppConfigurationModel | null>;
  create(data: AppConfigurationModel): Promise<void>;
  update(data: Partial<AppConfigurationModel>): Promise<void>;
  deleteAll(): Promise<void>;
}
