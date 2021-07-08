<template>
  <div class="layout-wrapper">
    <!-- TOP MENU -->
    <div class="layout-topbar"><a class="menu-button"><i class="pi pi-bars"></i></a><a href="#/" class="logo"><img
        alt="logo" src="/primevue/showcase/img/primevue-logo.2954558d.png"></a>
      <div class="app-theme"><img src="demo/images/themes/nano.jpg"></div>
      <ul class="topbar-menu">
        <li><a href="#/notyet" class="">Get Started</a></li>
        <li class="topbar-submenu">
          <a tabindex="0">
            <span class="p-overlay-badge">Themes
              <span id="pv_id_2_badge"
                    class="p-badge p-component p-badge-danger p-badge-dot">
              </span>
            </span>
          </a>
          <ul class="" style="display: none;">
            <li class="topbar-submenu-header">THEMING</li>
            <!--
            <li><a href="#/theming" class=""><i class="pi pi-fw pi-file"></i><span>Guide</span></a></li>
            <li><a href="https://www.primefaces.org/designer/primevue"><i class="pi pi-fw pi-palette"></i><span>Designer</span></a>
            </li>
            <li><a href="https://www.primefaces.org/designer-vue"><i class="pi pi-fw pi-desktop"></i><span>Visual Editor</span></a>
            </li>
            <li><a href="#/icons" class=""><i class="pi pi-fw pi-info-circle"></i><span>Icons</span></a></li>
            <li><a href="https://www.figma.com/community/file/890589747170608208/PrimeOne-Design-Library"><i
                class="pi pi-fw pi-pencil"></i><span>Figma UI Kit</span></a></li>
            <li class="topbar-submenu-header">BOOTSTRAP</li>
            <li><a><img src="demo/images/themes/bootstrap4-light-blue.svg"
                        alt="Blue Light"><span>Blue Light</span></a></li>
            <li><a><img src="demo/images/themes/bootstrap4-light-purple.svg"
                        alt="Purple Light"><span>Purple Light</span></a></li>
            <li><a><img src="demo/images/themes/bootstrap4-dark-blue.svg" alt="Blue Dark"><span>Blue Dark</span></a>
            </li>
            <li><a><img src="demo/images/themes/bootstrap4-dark-purple.svg" alt="Purple Dark"><span>Purple Dark</span></a>
            </li>
            <li class="topbar-submenu-header">MATERIAL DESIGN</li>
            <li><a><img src="demo/images/themes/md-light-indigo.svg" alt="Indigo Light"><span>Indigo Light</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-light-deeppurple.svg" alt="Deep Purple Light"><span>Deep Purple Light</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-dark-indigo.svg" alt="Indigo Dark"><span>Indigo Dark</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-dark-deeppurple.svg"
                        alt="Deep Purple Dark"><span>Deep Purple Dark</span></a></li>
            <li class="topbar-submenu-header">MATERIAL DESIGN COMPACT</li>
            <li><a><img src="demo/images/themes/md-light-indigo.svg" alt="Indigo Light"><span>Indigo Light</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-light-deeppurple.svg" alt="Deep Purple Light"><span>Deep Purple Light</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-dark-indigo.svg" alt="Indigo Dark"><span>Indigo Dark</span></a>
            </li>
            <li><a><img src="demo/images/themes/md-dark-deeppurple.svg"
                        alt="Deep Purple Dark"><span>Deep Purple Dark</span></a></li>
            <li class="topbar-submenu-header">FLUENT UI</li>
            <li><a><img src="demo/images/themes/fluent-light.png" alt="Fluent Light"><span>Fluent Light</span></a>
            </li>
            <li class="topbar-submenu-header">PRIMEONE</li>
            <li><a><img src="demo/images/themes/saga-blue.png" alt="Saga Blue"><span>Saga Blue</span></a></li>
            <li><a><img src="demo/images/themes/saga-green.png" alt="Saga Green"><span>Saga Green</span></a></li>
            <li><a><img src="demo/images/themes/saga-orange.png" alt="Saga Orange"><span>Saga Orange</span></a></li>
            <li><a><img src="demo/images/themes/saga-purple.png" alt="Saga Purple"><span>Saga Purple</span></a></li>
            <li><a><img src="demo/images/themes/vela-blue.png" alt="Vela Blue"><span>Vela Blue</span></a></li>
            <li><a><img src="demo/images/themes/vela-green.png" alt="Vela Green"><span>Vela Green</span></a></li>
            <li><a><img src="demo/images/themes/vela-orange.png" alt="Vela Orange"><span>Vela Orange</span></a></li>
            <li><a><img src="demo/images/themes/vela-purple.png" alt="Vela Purple"><span>Vela Purple</span></a></li>
            <li><a><img src="demo/images/themes/arya-blue.png" alt="Arya Blue"><span>Arya Blue</span></a></li>
            <li><a><img src="demo/images/themes/arya-green.png" alt="Arya Green"><span>Arya Green</span></a></li>
            <li><a><img src="demo/images/themes/arya-orange.png" alt="Arya Orange"><span>Arya Orange</span></a></li>
            <li><a><img src="demo/images/themes/arya-purple.png" alt="Arya Purple"><span>Arya Purple</span></a></li>
            <li class="topbar-submenu-header">PREMIUM</li>
            <li><a><img src="demo/images/themes/soho-light.png" alt="Soho Light"><span>Soho Light</span></a></li>
            <li><a><img src="demo/images/themes/soho-dark.png" alt="Soho Dark"><span>Soho Dark</span></a></li>
            <li><a><img src="demo/images/themes/viva-light.svg" alt="Viva Light"><span>Viva Light</span></a></li>
            <li><a><img src="demo/images/themes/viva-dark.svg" alt="Viva Dark"><span>Viva Dark</span></a></li>
            <li><a><img src="demo/images/themes/mira.jpg" alt="Mira"><span>Mira</span></a></li>
            <li><a><img src="demo/images/themes/nano.jpg" alt="Nano"><span>Nano</span></a></li>
            <li class="topbar-submenu-header">LEGACY</li>
            <li><a><img src="demo/images/themes/nova.png" alt="Nova"><span>Nova</span></a></li>
            <li><a><img src="demo/images/themes/nova-alt.png" alt="Nova Alt"><span>Nova Alt</span></a></li>
            <li><a><img src="demo/images/themes/nova-accent.png" alt="Nova Accent"><span>Nova Accent</span></a></li>
            <li><a><img src="demo/images/themes/nova-vue.png" alt="Nova Vue"><span>Nova Vue</span></a></li>
            <li><a><img src="demo/images/themes/luna-amber.png" alt="Luna Amber"><span>Luna Amber</span></a></li>
            <li><a><img src="demo/images/themes/luna-blue.png" alt="Luna Blue"><span>Luna Blue</span></a></li>
            <li><a><img src="demo/images/themes/luna-green.png" alt="Luna Green"><span>Luna Green</span></a></li>
            <li><a><img src="demo/images/themes/luna-pink.png" alt="Luna Pink"><span>Luna Pink</span></a></li>
            <li><a><img src="demo/images/themes/rhea.png" alt="Rhea"><span>Rhea</span></a></li>
                 -->
          </ul>
        </li>
        <li class="topbar-submenu"><a tabindex="0">Templates</a>
          <!--
          <ul style="display: none;" class="">
            <li class="topbar-submenu-header">FREE ADMIN TEMPLATE</li>
            <li><a href="https://www.primefaces.org/sigma-vue"><img
                src="data:image/png;base64,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"
                alt="Sigma"><span>Sigma</span></a></li>
            <li class="topbar-submenu-header">PREMIUM ADMIN TEMPLATES</li>
            <li><a href="https://www.primefaces.org/layouts/freya-vue"><img
                src="data:image/png;base64,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"
                alt="Freya"><span>Freya</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/diamond-vue"><img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABsCAMAAACW/YZtAAABpFBMVEX////JzM5janBTWmFmbXPIy83g4eNPV15IUFf39/iMkZZJUVi6vcC+wcNOVl3Q0tSVmZ10e4Dx8vJXXmXs7e709PTNz9GgpKj9/f34+PilqayqrbGTmJzq6+xaYWdQWF5RWWBLU1p3fYL7+/vc3d9RWF/Lzc/29/dWXWS0uLqdoqVKUlnl5uf09fXLztDb3d6prbBdZGrx8fKOk5fp6utZYGe3ur1ZYGbo6epMU1plbHJla3Hz8/SSl5v+/v6Kj5R0en/6+vqHjJGGi5CcoKSztrmxtbjIyszGycvZ29zY2dvn6OlWXmTm5+ijp6tjaW/5+flyeH1xd32EiY6DiI2YnaGYnKCvsrWtsbTDxsjDxchYX2XV19hOVVzU1tfk5eZVXGPj5OXw8fFgZ23v8PFTW2KUmZ1udHptc3nt7u+Ahop/hImTl5yqrrHBw8a/wsTT1NbR09Xi4+Th4uNeZWtrcndqcXf29vZ8gYZ7gYb8/PyPlJisr7Omqq28vsHO0NLf4OFSWmDX2dpbY2mgpKeNkpZpcHVobnRbYmi+wcRUXGLN0NK+mYXoAAAD1UlEQVR4AezRB2oFMRAE0dmcfs5O9z+ms920loFGcrbqAg8oy+VyuVwuuqKsIqqbVLft+qi6Ns0d6j6yekiCx/6pat7UvzZV8/qnxhR38eLarOUTvFo9wUub9SIvkgdXjrteO3KFzUmDK8c1c+QKm+MHM8wuyQxjc+TgDcPssszwBptjBm93DLPLMsO7bdTm18H7w5Fhdllm+HjYh5v1wdPJGGaX5RC20xRs1gefDbDjksywnYPN+uALYM9lmeFLsFkfbIDZ9WSGLdisDwbMri8zzJv1wQST68oM02Z9MMHs+jLBtFkfDFhwIROMzfpgguEKMmBs1gcTDFeRAWOzPJhguJoMGJvVwQTD1WTA+mYMBjzB1eQJMDbLgwH3cDW5ByxuxmDAcHUZsLb5qu4/sfrKvK77T+3GvG6/C757kBxm30AeJKTAjB9g6uBDEVIECSkp445kFVWQxWrIQuoaQCFNBhKAFlCDtg6GsSy6+DTpaQOVyOsjCxkARQC01AOvHkEYR/G6/9p2r22rtm3buLXdj93s3j7Ju+lJZ3YyM8EaZ5LfdFRN8h6dWXFX5ZnuHknru///WK8k9fUHJlvwQHelyEFJNdWu53LsQ8NhyRY8UnGiKkPc1Op8cHRMkrZsDUqG4NFtktTr8WTVZknaPhqSDMGNtgi7R0u+fu0ISIbgnZI0Nur3cHfOeVfpZAjePccBmDjvCUheUQzeO98JGDjP31c6ednUQvD+JQTYzfnAwbLJhwrBi6cwYDfnw52Q7B185CgA9uR8bBUkewaPHgfA3pxPrIRkv+CTBNif8ylOdgefZsD+nM9wsiv4LAEux/nc3+TznMzBFwhwSc4XL9ncUTIHX64HwKU5X7k6oaMHkjn42nUAHMD5+g2P5Lqbkm7lu6tuA+AgzndWuZPbJV28m+2tvAeAAznfX+lIzriZvVsAOJjzA0rm4IcEOJxzOyRj8CMR4HDOegzJEPxkgAGHcx54ysnF4Gc3AwA7OE99jsmF4LvjQYAdnMeXQnIhuO4FAI7A+eUrS+bgla8RcATOb95aMga/Y8AxOHdh8vuJ4A8MOA7n1ZB8pCcP/siAY3Ge+2/y6Tz4EwOOx3m5JReDP39hwPE4f/n6rZicB+/9xoBjcv72vZCcB//4yYDjcp7yxZIteM4vAJyAsyzZggWAk3CWJU8EiwCn4GzJFkyAk3C2ZAsGwKk4W3LVb0kAOBlnS26QBICTcbbkqg4JAKflnCVnwQA4OeeODgScnjMDTs+ZAafnnBKwm3N6wMyZAP8Z7UFnalc3DYwdBaNgFIyCUTAKAOW0uhIgZW2aAAAAAElFTkSuQmCC"
                alt="Diamond"><span>Diamond</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/sapphire-vue"><img
                src="data:image/png;base64,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"
                alt="Sapphire"><span>Sapphire</span><span class="theme-badge material">material</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/serenity-vue"><img
                src="/primevue/showcase/img/themeswitcher-serenity.87d953ea.png"
                alt="Serenity"><span>Serenity</span><span class="theme-badge material">material</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/ultima-vue"><img
                src="data:image/png;base64,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"
                alt="Ultima"><span>Ultima</span><span class="theme-badge material">material</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/avalon-vue"><img
                src="/primevue/showcase/img/themeswitcher-avalon.972e5ca5.png" alt="Avalon"><span>Avalon</span><span
                class="theme-badge bootstrap">bootstrap</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/babylon-vue"><img
                src="/primevue/showcase/img/themeswitcher-babylon.dbb07d16.png" alt="Babylon"><span>Babylon</span></a>
            </li>
            <li><a href="https://www.primefaces.org/layouts/apollo-vue"><img
                src="data:image/png;base64,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"
                alt="Apollo"><span>Apollo</span><span class="theme-badge darkmode">dark mode</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/roma-vue"><img
                src="/primevue/showcase/img/themeswitcher-roma.4510cef2.jpg" alt="Roma"><span>Roma</span></a></li>
            <li><a href="https://www.primefaces.org/layouts/prestige-vue"><img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABsCAIAAAAuQeEIAAAGy0lEQVR4Ae3dg5/j3BrA8fuHnfVevrZtm2uNbdudtbrG2PZMkSZVaiVNgzt5/S6GJ+20eX6f5y/4DqrT8/xDgqISQAM0QEMAHY/QEEADNATQAC2Iks7JXZoNasb8HkYAaMy4s3auZsj3yRl6bxmFikhUSKICclcxdeK6y+rjAXqzTdu53G7P43UWVELJU0zKyr9Dy5NP7iqkavq9ggjQ64/lxTMzgVc1NlROoTIKlVIrQKO85TF9fZpmImvGBmh/WKgc9j3SYEUVlKy8ZmiUK1sLIkCv4be4eTLwSKMVVZrlWT80yjE1DfkAeqX6Kfb5dhuqNqMq82agd+eTjgAP0A/IywpHO9yoxiwrbxZanrw7boC+t1Fr+CmNDdWaMUI/WkJFBBGgf2tZonrcv73eIitjhUbZpj4DI2GqpcsbYIR4hWZ58dBdN1pWrlMEurTTI2HqUJv95VzSSHNxCf2+1iErKwb9RbtdwlSB1okO6B9JIqZNbPxBowaLotBPlpklTDV2eJah0X79nsOGoSUGoP8GvS3LhOvx8NKw/1dotO8+a4BGWSYbpnearo0H/oCWrQ8Z/vY/BKBN7oiEo7vTwb9Co5/1jxwnSAcH0L9Bz9vxWHTPhe6BRj/pX840BVgBoHFCD+uY+6HRj7qf6qyiKEkATbgiiv1Gy9DL09rhAWj5wRD3/+h7oXft0+usYbVDc7wo4Ug76n8YNPpB91YOKQgqhn60mJIwpenxrgCNvte1dXjVC/1hs03CVMlV18rQ/zpgcPp4lUJn3nBLmDqisa8ILU/mKYdKobXTQQlT75eaV4Xe/oPORHOqg96eY/KEBAlT/zpuXBUafadL0dCqg/5MY5cwRTojsvIaoHf+oKe9vLqgby+EJExdHQusERp9qyvXulQE/Vq9lRckXKWedawd+omjRl4Q1QI9RLASvp7NItcMLU/XVFAV0KVdHozKC5YwOmhYF/TRJlviQx+94sR7yKD4mmu90P/ep+ciYsJCb8sjS7s9WJElXpCeyDCtFxp9s9Q/F0pM6NebbMMkK+Hu5mQQHTJsALrwnCPRoN9ptWlngwqdSXqrxLwx6LezyESA3llKvddurxrwLSr5qV3XXEhW3hD09m+XWE7cKtBvXqTfvPDLnKffPPf7nP1lztBvnpbnrdP2Ty/Q32mdKXfcZf2+S3PBKVs4zIuSwkUE8aV8asPQ6OulCT2DHzrxqr3rQYcNm4E+0+0F6FXS2bldx42bhM474wDolWI48dUiCh0xbBL6+woLQK90jHifxi4rbxr6vWwSoB9a/lUXOmrAAv3UESNAP7jiG250zIAL+l8/6QH63gRRyta60DEjPmh5APpv+RnhhzY7Om4EaAWbtYRfLKLQCSNAKxXHi5Udnh0pRlkZoBWqZ4l5qZRCyUaUpBT0nh90qoYeJ9nPW+wohZCVsUPD0ztBlO4uhD5psqFUQh7loeV3SlUFTbgi5Z2ep0splE6gNCJq0D9WWRMfWhCleRtX1eN9q96KMgmUIU+UoXNPOxITmuHEMYptGfYdvOh4pJT65Xy0PJuChrdJ/awwa+duLIRqB3wnrrteb7Jtz7/nkCMG6AR54/8uwdw7xt9Guxi6NB86PxdsnQw0j/tL+71pd937rjo/OUu/2mr7X5V55QM0sYaWP8piwqJaju3GEPrd7Kh8OAvQ8scrAB0F6L7ZkOLQAL33J104CkfCAPpQvU3CFEDDsd1YQz9+JCoH0QG69LILlzJAw5eFYg2d1EpjVAZo+EJnTKFT22lMvAC98pfu/bzi0ADdfMej+DUSAP1OLsULorLQAL3rZ/2iOYzfGKDh8qoYQP8YhevYAPqlDFOAiYcLBrtJtnjY96HWsaM+7qBjcGUmhoKc2EEwaT2ex1utcQG995BhimDjeGuFIMr3/Sd1evbWWbYsdOyvNcZYgBPrx/yPN1m3DvTWuqgb+7+Uwj7v9oqtAv1IknGSYBN2KdmQmf1fnSXm0C/mkCZHzJcpKG8dW+jvG2z+2K8HUb4FJxcr6J1HjY0dXlFUxz7DDgMTE+g3i83z5rCKFke2TwWiDL03yVjf4eEFlW3oLOz1Rg16+zHDiTMO2sercRXqgeuuKEBvP248fIo20Jx6d86+f5ZWFPqRbFPhdbfVE1H7ct8pWzizU17uixd6dzqx7yR9czp47w31sK56whquHPB9csa+u5TaGPS2VOL1Kkv2VVfXQojhRNiivPrlUnN27tJMsLDLs++y8702+9NVln8Wk3+F3pVLPlFqfqPO8t0pOuu6q33IP0KwgbAAO2chgAZogIYAGqChzUNDAA3Q0P8B9EQJ/X9pwmcAAAAASUVORK5CYII="
                alt="Prestige"><span>Prestige</span></a></li>
          </ul>
          -->
        </li>
        <li class="topbar-submenu topbar-resources-submenu"><a tabindex="0">Resources</a>
          <!--
          <ul style="display: none;" class="">
            <li><a href="#/support" class=""><span>Support</span></a></li>
            <li><a href="https://forum.primefaces.org/viewforum.php?f=110"><span>Forum</span></a></li>
            <li><a href="https://discord.gg/gzKFYnpmCY" target="_blank"><span>Discord Chat</span></a></li>
            <li><a href="https://github.com/primefaces/primevue" target="_blank"><span>Source Code</span></a></li>
            <li><a href="https://www.primefaces.org/store" target="_blank"><span>PrimeStore</span></a></li>
            <li><a href="https://www.primefaces.org/category/primevue/" target="_blank"><span>Blog</span></a></li>
            <li><a href="https://www.youtube.com/channel/UCTgmp69aBOlLnPEqlUyetWw/featured" target="_blank"><span>PrimeTV</span></a>
            </li>
            <li><a href="https://twitter.com/primevue?lang=en" target="_blank"><span>Twitter</span></a></li>
            <li><a href="https://www.primefaces.org/whouses" target="_blank"><span>Who Uses</span></a></li>
            <li><a href="https://www.primefaces.org/newsletter" target="_blank"><span>Newsletter</span></a></li>
            <li><a href="https://www.primetek.com.tr" target="_blank"><span>About PrimeTek</span></a></li>
          </ul>
          -->
        </li>

      </ul>
    </div>
    <!-- SIDE MENU -->
    <div class="layout-sidebar">
      <a href="#/" class="logo">
        <img alt="logo"   src="../assets/logo.png">
      </a>
      <div class="layout-sidebar-filter p-fluid p-input-filled">
        <h5>Site search</h5>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
              aria-autocomplete="list" aria-controls="pv_id_3_list"
              placeholder="art, contact, distribution"
              v-model="search"
              type="text"
              autocomplete="off"
              role="searchbox" >test
          </InputText>
        </span>

      </div>
      <div class="layout-menu">
        <menu-main></menu-main>
      </div>
      <!--
      <div class="layout-menu">
        <Accordion :active-index="0">
          <AccordionTab header="Art">
            <Listbox
                v-model="art" :options="cities" optionLabel="name" style="width:15rem" />
            List of actions on Art
          </AccordionTab>
          <AccordionTab header="Artist">
            List of artist actions
          </AccordionTab>
        </Accordion>
        <div class="menu-category">Art</div>
        <div class="menu-items">
          <a href="https://www.primefaces.org/primevue/showcase-v2" target="_blank">PrimeVue 2</a>
        </div>
      </div>
      -->
    </div>

    <div class="layout-content p-p-4">
        <router-view></router-view>
          <!--
          <div class="card">
            <h5>InputText</h5>
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-lg-4 p-mb-lg-0">
                <InputText type="text" placeholder="Default"></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-lg-4 p-mb-lg-0">
                <InputText type="text" placeholder="Disabled" :disabled="true"></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-lg-4 p-mb-lg-0">
                <InputText type="text" placeholder="Invalid" class="p-invalid" />
              </div>
            </div>
          </div>
          -->
    </div>
  </div>
</template>

<script>

import { ref } from 'vue';
import MenuMain from "../components/menu-main.vue";
export default {
  name: "index.vue",
  components: {MenuMain},
  setup() {
    const search = ref('')
    const items = ref([
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        to: '/'
      },
      {
        label: 'Calendar',
        icon: 'pi pi-fw pi-calendar',
        to: '/calendar'
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        to: '/edit'
      },
      {
        label: 'Documentation',
        icon: 'pi pi-fw pi-file',
        to: '/documentation'
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        to: '/settings'
      }
    ]);
    const leftActions = ref([
      { header: 'Art', items: [
          {caption: 'List', id: 'art-list'},
          {caption: 'Create', id: 'art-new'}
        ]
      }
    ])

    return {
      items,
      search,
      leftActions
    }
  }
}
</script>

<style scoped>

</style>
