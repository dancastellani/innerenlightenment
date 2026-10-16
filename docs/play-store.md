# Publishing on Google Play

Nothing is uploaded to Google Play automatically: each step below is done by Dan. Claude can prepare files (texts, the privacy policy page, screenshots) when asked.

## Before the first release

1. **App icon.** `mobile/assets/` still has Expo's placeholder icons (the blue "A"). Replace `icon.png` (1024×1024) and the three `android-icon-*.png` files (foreground, background, monochrome) with the real icon. Google Play also needs a 512×512 icon and a 1024×500 feature graphic.
2. **Package name.** `mobile/app.json` sets `android.package` to `com.innerenlightenment.app`. Google Play never lets it change after the first upload, so confirm it (or pick another) before then.
3. **Privacy policy.** Google Play asks every app for a public privacy policy link. Ours is short: the app collects nothing and sends nothing; settings and the planned messages stay on the phone. It can live on the GitHub Pages site (issue #35).
4. **Content rights.** Confirm with Marcelo that the messages may be published in the app (and the translations).

## Google Play Console

1. **Developer account.** Sign up at [play.google.com/console](https://play.google.com/console) (one-time US$25 fee) and verify your identity. A new personal account must run a **closed test with at least 12 testers for 14 days** before it can publish to everyone.
2. **Create the app.** Name *Inner Enlightenment*, free, app (not game).
3. **App content.** Fill in: privacy policy link, ads (none), app access (no login), content rating questionnaire, target audience, and the **Data safety** form (no data collected or shared).
4. **Store listing.** Short and full description, the icon and feature graphic from above, and at least two phone screenshots (`docs/screenshots/` has some).

## Each release

1. Run `./run.sh build production` from your laptop. It builds an AAB (Android App Bundle) on Expo's servers, signed with the same key as the preview APK, and raises the version code by itself.
2. Download the `.aab` from the link it prints.
3. In the Play Console, open **Testing → Closed testing** (later **Production**), create a release, upload the `.aab`, write what changed, and send it for review. The first review can take a few days.

Small code-only fixes can reach installed store apps without a new release: `eas update --channel production`. A change that adds a native package needs a new build and release.
