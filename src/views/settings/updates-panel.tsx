import { useT } from "@/lib/i18n";
import { ExperimentalChangelog } from "@/components/update/experimental-changelog";
import { isLinuxDesktop } from "@/lib/platform";
import { Section } from "./shared";
import { BetaChannelRow, UpdatesRow } from "./advanced-panel";
import { RollbackRow } from "./rollback-row";
import { BuildFeedback } from "./build-feedback";
import { BackupRow } from "./backup-row";
import { SettingsRecoverRow } from "./settings-recover-row";
import { ExperimentalBuildsSection } from "./experimental-builds-section";
import { readBetaReturnContext } from "@/lib/updater/beta-return";
import { useExperimentalAccess } from "@/lib/updater/experimental-access";
import { HARBOR_UPDATES_ENABLED, HARBOR_DOWNLOAD_URL } from "@/lib/config/endpoints";
import { openUrl } from "@/lib/window";
import { SButton } from "./ui";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function UpdatesPanel() {
  const t = useT();
  const supportsInAppUpdates = HARBOR_UPDATES_ENABLED && isTauri && !isLinuxDesktop();
  const experimentalInstalled = readBetaReturnContext(__APP_VERSION__) !== null;
  const experimentalAccess = useExperimentalAccess();

  return (
    <>
      <ExperimentalChangelog />
      {!HARBOR_UPDATES_ENABLED && (
        <Section
          title={t("Updates")}
          subtitle={t("Automatic updates are not configured for this build. Download builds from our GitHub repository.")}
        >
          <SButton onClick={() => void openUrl(HARBOR_DOWNLOAD_URL)}>{t("Download")}</SButton>
        </Section>
      )}
      {supportsInAppUpdates && (
        <Section
          title={t("Updates")}
          subtitle={t(
            "Harbor checks our update server for new versions. Nothing installs until you choose to.",
          )}
        >
          <UpdatesRow />
          <BetaChannelRow />
          {!experimentalInstalled && <RollbackRow />}
          <BuildFeedback />
        </Section>
      )}

      {HARBOR_UPDATES_ENABLED && (experimentalAccess || experimentalInstalled) && <ExperimentalBuildsSection />}

      <Section
        title={t("Backup & restore")}
        subtitle={t(
          "Export your entire Harbor setup to a single file, then restore it on a new computer or keep it as a backup. Everything is included except your Stremio sign-in.",
        )}
      >
        <SettingsRecoverRow />
        <BackupRow />
      </Section>
    </>
  );
}
