import path from 'node:path'
import { Config } from '@remotion/cli/config'

// Empur diimpor dari ../frontend. React harus satu salinan, jadi semua impor react diarahkan ke milik video.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      react: path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
    },
  },
}))
