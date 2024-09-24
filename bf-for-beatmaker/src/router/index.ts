import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const checkAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  let isAuth = false

  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      isAuth = true
      if (to.path === '/auth') {
        // Если пользователь уже аутентифицирован и пытается попасть на страницу /auth, перенаправляем его на главную
        next('/')
      } else {
        next()
      }
    } else {
      isAuth = false
      if (to.path !== '/auth') {
        // Если пользователь не аутентифицирован и пытается попасть на защищенную страницу, перенаправляем его на /auth
        next('/auth')
      } else {
        next()
      }
    }
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/PageHome.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/PageAuth.vue'),
    beforeEnter: (to, from, next) => {
      let isAuth = false
      onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          // Если пользователь уже аутентифицирован, перенаправляем на главную
          next('/')
        } else {
          next()
        }
      })
    }
  },

  {
    path: '/interview/:id',
    name: 'Interview',
    component: () => import('@/views/PageInterview.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/PageList.vue'),
    beforeEnter: checkAuth
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
