"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import { Input } from "@/components/ui/input";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import UploadFile from "@/components/ui/uploaders/UploadFile";
import { UserDto } from "@/db/models";
import { languages } from "@/i18n/settings";
import { IServerAction } from "@/lib/dtos/ServerComponentsProps";
import { useRouter } from "next/navigation";
import i18next from "i18next";

export default function UserProfileSettings({ user, serverAction }: { user: UserDto; serverAction: IServerAction }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const inputFirstName = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      serverAction.action(new FormData(form));
    });
  }

  useEffect(() => {
    inputFirstName.current?.focus();
    inputFirstName.current?.select();
  }, []);

  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar ?? undefined);
  const [uploadingImage, setUploadingImage] = useState(false);

  function onChangedLocale(lang: string) {
    i18next.changeLanguage(lang);
    router.refresh();
  }

  function deleteAccount() {
    if (user?.admin) {
      errorModal.current?.show(t("settings.profile.errors.cannotDeleteAdmin"));
    } else {
      confirmModal.current?.show(t("settings.danger.confirmDelete"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }
  function confirmDelete() {
    const form = new FormData();
    form.set("action", "deleteAccount");
    // submit(form, { method: "post" });
    serverAction.action(form);
  }
  function loadedImage(image: string | undefined) {
    setAvatar(image);
    setUploadingImage(true);
  }

  return (
    <div>
      <div>
        <SettingSection title={t("settings.profile.profileTitle")} description={t("settings.profile.profileText")}>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={onSubmit} action={serverAction.action}>
              <input hidden type="text" name="action" value="profile" readOnly />
              <div className="">
                <div className="">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 sm:col-span-6 md:col-span-6">
                      <label htmlFor="email" className="mb-1 text-sm font-medium">
                        {t("account.shared.email")} <span className="text-red-500">*</span>
                      </label>
                      <Input required disabled type="email" name="email" title={t("account.shared.email")} defaultValue={user?.email} />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label htmlFor="first_name" className="mb-1 text-sm font-medium">
                        {t("settings.profile.firstName")} <span className="text-red-500">*</span>
                      </label>
                      <Input name="firstName" title={t("settings.profile.firstName")} defaultValue={user?.firstName} required />
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <label htmlFor="last_name" className="mb-1 text-sm font-medium">
                        {t("settings.profile.lastName")} <span className="text-red-500">*</span>
                      </label>
                      <Input name="lastName" title={t("settings.profile.lastName")} defaultValue={user?.lastName} />
                    </div>

                    <div className="col-span-6 sm:col-span-6">
                      <label htmlFor="avatar" className="block text-xs font-medium leading-5 text-gray-700">
                        {t("shared.avatar")}
                      </label>
                      <div className="mt-2 flex items-center space-x-3">
                        <input hidden id="avatar" name="avatar" value={avatar} readOnly />
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                          {(() => {
                            if (avatar) {
                              return <img id="avatar" alt="Avatar" src={avatar} />;
                            } else {
                              return (
                                <svg id="avatar" className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              );
                            }
                          })()}
                        </div>

                        {avatar ? (
                          <ButtonTertiary destructive={true} onClick={() => loadedImage("")} type="button">
                            {t("shared.delete")}
                          </ButtonTertiary>
                        ) : (
                          <UploadFile accept="image/png, image/jpg, image/jpeg" description="" className="h-12" onDropped={loadedImage} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <div id="form-success-message" className="flex items-center space-x-2"></div>
                    <button
                      disabled={serverAction.pending}
                      type="submit"
                      className="inline-flex items-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      {t("shared.save")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        <SettingSection
          title={t("settings.profile.securityTitle")}
          description={
            <p className="mt-1 text-xs leading-5 text-gray-600">
              {t("account.login.forgot")}{" "}
              <a className="text-theme-600 hover:text-theme-500 font-bold" href={"/forgot-password?e=" + user?.email || ""}>
                {t("account.reset.button")}
              </a>
            </p>
          }
        >
          {/*Security */}
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={onSubmit} action={serverAction.action}>
              <input hidden type="text" name="action" value="password" readOnly />
              <div className="">
                <div>
                  <div className="">
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="passwordCurrent" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("settings.profile.passwordCurrent")}
                        </label>
                        <input
                          required
                          type="password"
                          id="passwordCurrent"
                          name="passwordCurrent"
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="password" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("settings.profile.password")}
                        </label>
                        <input
                          title={t("settings.profile.password")}
                          required
                          type="password"
                          id="passwordNew"
                          name="passwordNew"
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="passwordConfirm" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("settings.profile.passwordConfirm")}
                        </label>
                        <input
                          title={t("settings.profile.passwordConfirm")}
                          required
                          type="password"
                          id="passwordNewConfirm"
                          name="passwordNewConfirm"
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="flex justify-between space-x-2">
                      <div id="form-success-message" className="flex items-center space-x-2"></div>
                      <button
                        type="submit"
                        className="inline-flex items-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {t("shared.save")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        <SettingSection title={t("settings.preferences.title")} description={t("settings.preferences.description")}>
          {/*Preferences */}
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="">
              <div className="">
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-6 sm:col-span-6">
                    <label htmlFor="locale" className="block text-sm font-medium leading-5 text-gray-700">
                      {t("settings.preferences.language")}
                    </label>
                    <select
                      id="locale"
                      required
                      value={i18n.language}
                      onChange={(e) => onChangedLocale(e.currentTarget.value)}
                      className="focus:border-theme-500 focus:ring-theme-500 mt-1 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm"
                    >
                      {languages.map((locale, idx) => {
                        return (
                          <option key={idx} value={locale}>
                            {t("shared.locales." + locale)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
          {/*Danger */}
          <div className="mt-12 md:col-span-2 md:mt-0">
            <div>
              <input hidden type="text" name="action" value="deleteAccount" readOnly />
              <div className="">
                <div className="">
                  {/* <h3 className="text-lg font-medium leading-6 text-foreground">{t("settings.danger.deleteYourAccount")}</h3>
                  <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                    <p>{t("settings.danger.onceYouDelete")}.</p>
                  </div> */}
                  <div className="">
                    <ButtonPrimary destructive={true} onClick={deleteAccount}>
                      {t("settings.danger.deleteAccount")}
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingSection>
      </div>
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmModal} onYes={confirmDelete} />
    </div>
  );
}
