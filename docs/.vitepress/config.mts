import { defineConfig } from 'vitepress'

// 导入主题的配置
import { blogTheme } from './blog-theme'

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  ignoreDeadLinks: true,
  // base,
  lang: 'zh-cn',
  title: '炒花生送白粥',
  description: '粥里有勺糖的博客主题，基于 vitepress 实现',
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目录'
    },
    // 默认文案修改
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '上次更新于',

    // 设置logo
    logo: '/logo.png',
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      {
        text: '关于',
        link: '/about'
      },
      {
        text: '个人作品',
        items: [
          {
            text: '个人主页',
            link: 'https://ldpc.us.kg'
          }, 
          {
            text: '网站导航',
            link: 'https://wabp.us.kg'
          },
          {
            text: '个人网盘',
            link: 'http://pan.527200.xyz'
          }
        ]
      },
      {
        text: '在线工具',
        items: [
          {
            text: '小霸王游戏',
            link: 'https://www.wexyx.com'
          },
          {
            text: 'PDF24 Tools',
            link: 'https://tools.pdf24.org/zh'
          },
          {
            text: '个人图床',
            link: 'https://pan.sdjy.eu.org'
          },
          {
            text: '在线tools',
            link: 'https://tool.lu'
          },
          {
            text: '图片+水印',
            link: 'https://image.sdyun.eu.org'
          },
          {
            text: '证件照PS',
            link: 'https://swanhub.co/ZeYiLin/HivisionIDPhotos/demo'
          },
          {
            text: '在线简历生成',
            link: 'https://resume.sugarat.top/'
          }
        ]
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ATQQ/sugar-blog/tree/master/packages/theme'
      }
    ]
  }
})
