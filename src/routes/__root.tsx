import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider } from '../lib/authContext'

import appCss from '../styles.css?url'
import nutriflowCss from '../nutriflow.css?url'

const SITE_URL = 'https://nutriflow-main.vercel.app'
const SITE_TITLE = 'NutriFlow AI — Gestão Nutricional Hospitalar'
const SITE_DESCRIPTION =
  'Sistema de gestão nutricional hospitalar com inteligência artificial: planos alimentares gerados a partir do estoque da cozinha, prontuário clínico, cozinha em tempo real e fluxo completo médico → nutricionista → cozinha → paciente.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: SITE_TITLE,
      },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'theme-color',
        content: '#10b981',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'NutriFlow AI' },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: `${SITE_URL}/logo512.png` },
      { property: 'og:locale', content: 'pt_BR' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: `${SITE_URL}/logo512.png` },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: SITE_URL,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: nutriflowCss,
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'NutriFlow AI',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web',
          description: SITE_DESCRIPTION,
          inLanguage: 'pt-BR',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        }),
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('nutriflow-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){}",
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
