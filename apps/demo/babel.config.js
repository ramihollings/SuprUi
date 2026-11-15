/**
 * Babel config for the Supr UI demo app (Expo SDK 55 tooling).
 *
 * `babel-preset-expo` is the Expo preset. `react-native-worklets/plugin`
 * (Reanimated 4's Babel plugin — it lives in the worklets package, not in
 * `react-native-reanimated/plugin`) must be listed last. There is NO
 * `nativewind/babel` plugin here on purpose: demo screens style from the
 * token theme object (`useTheme()`), never from NativeWind classes — the
 * classes resolve to the static dark set and cannot switch dark/light at
 * runtime (see @mrtechnology/ui-native README). NativeWind + Tailwind are still
 * declared dependencies because they are peers of @mrtechnology/ui-native.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
