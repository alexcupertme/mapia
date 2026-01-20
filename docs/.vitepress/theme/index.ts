import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import ImageViewerP from '@miletorix/vitepress-image-viewer' //[!code ++]
import '@miletorix/vitepress-image-viewer/style.css' //[!code ++]

export default {
  extends: DefaultTheme,
  enhanceApp(ctx: any) {
    ImageViewerP(ctx.app) //[!code ++]
  }
}
