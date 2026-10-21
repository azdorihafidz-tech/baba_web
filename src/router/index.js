// router/index.js - SOLUSI LENGKAP
import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";

const routes = [
  {
    path: "/",
    redirect: "/admin/login", // redirect otomatis jika ke domain utama
  },

  {
    path: "/admin/login",
    name: "Login",
    component: () => import("@/views/admin/Login.vue"),
    meta: {
      title: "Login || BABA PARFUME",
      requiresAuth: false, // Tidak perlu login
    },
  },

  {
    path: "/admin/registrasi",
    name: "PublicRegistrasi",
    component: () => import("@/views/admin/Registrasi.vue"),
    meta: {
      title: "Registrasi || BABA PARFUME",
      requiresAuth: false,
    },
  },

  {
    path: "/admin/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/admin/ForgotPassword.vue"),
    meta: {
      title: "Lupa Password || BABA PARFUME",
      requiresAuth: false,
    },
  },

  {
    path: "/admin/reset-password",
    name: "ResetPassword",
    component: () => import("@/views/admin/ResetPassword.vue"),
    meta: {
      title: "Reset Password || BABA PARFUME",
      requiresAuth: false,
    },
  },

  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "Page Not Found || BABA PARFUME",
      requiresAuth: false,
    },
  },

  {
    path: "/admin",
    name: "Main",
    component: () => import("@/components/layouts/admin/Main.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: {
          title: "Dashboard || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "strukturhierarkiakun",
        name: "StrukturHierarkiAkun",
        component: () => import("@/views/admin/StrukturHierarkiAkun.vue"),
        meta: {
          title: "Struktur Hierarki || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "provinsi",
        name: "Provinsi",
        component: () => import("@/views/admin/Provinsi.vue"),
        meta: {
          title: "Provinsi || BABA PARFUME",
        },
      },
      {
        path: "user",
        name: "User",
        component: () => import("@/views/admin/User.vue"),
        meta: {
          title: "User || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "jabatan",
        name: "Jabatan",
        component: () => import("@/views/admin/Jabatan.vue"),
        meta: {
          title: "Jabatan || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "mvo",
        name: "Mvo",
        component: () => import("@/views/admin/Mvo.vue"),
        meta: {
          title: "Mvo || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "mvotype",
        name: "MvoType",
        component: () => import("@/views/admin/MvoType.vue"),
        meta: {
          title: "Mvo Type|| BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "mvodocument",
        name: "MvoDocument",
        component: () => import("@/views/admin/MvoDocument.vue"),
        meta: {
          title: "Mvo Document|| BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "masterheaders",
        name: "MasterHeaders",
        component: () => import("@/views/admin/MasterHeaders.vue"),
        meta: {
          title: "Master Headers|| BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "documentbelumapprove",
        name: "DocumentBelumApprove",
        component: () => import("@/views/admin/DocumentBelumApprove.vue"),
        meta: {
          title: "Document Belum Approve|| BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "mvobelumapprove",
        name: "MvoBelumApprove",
        component: () => import("@/views/admin/MvoBelumApprove.vue"),
        meta: {
          title: "Mvo Belum Approve|| BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "store",
        name: "Store",
        component: () => import("@/views/admin/Store.vue"),
        meta: {
          title: "Store || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "uplouddocumentasi",
        name: "UploudDocumentasi",
        component: () => import("@/views/admin/UploudDocumentasi.vue"),
        meta: {
          title: "Uploud Documentasi || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "mutasi",
        name: "mutasi",
        component: () => import("@/views/admin/Mutasi.vue"),
        meta: {
          title: "Mutasi Jabatan || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "chat",
        name: "chat",
        component: () => import("@/views/admin/Chat.vue"),
        meta: {
          title: "Chat || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "Profil",
        name: "Profil",
        component: () => import("@/views/admin/Profil.vue"),
        meta: {
          title: "Profil || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "Tutorial",
        name: "Tutorial",
        component: () => import("@/views/admin/Tutorial.vue"),
        meta: {
          title: "Tutorial || BABA PARFUME",
          requiresAuth: true,
        },
      },
      {
        path: "Downline",
        name: "Downline",
        component: () => import("@/views/admin/Downline.vue"),
        meta: {
          title: "Downline || BABA PARFUME",
          requiresAuth: true,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// ROUTER GUARD YANG DIPERBAIKI
router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");


  // Jika sudah login dan mencoba akses login/registrasi
  if ((to.name === "Login" || to.name === "PublicRegistrasi") && token) {
    next({ name: "Dashboard" });
    return;
  }

  // Jika belum login dan mencoba akses halaman yang butuh auth
  if (
    to.meta.requiresAuth !== false &&
    !token &&
    to.name !== "Login" &&
    to.name !== "PublicRegistrasi"
  ) {
    next({ name: "Login" });
    return;
  }

  // Jika akses route utama /admin
  if (to.name === "Main") {
    next({ name: "Dashboard" });
    return;
  }

  // Lanjutkan navigasi normal
  next();
});

// Set page title setelah navigasi
router.afterEach((to) => {
  const pageTitle = to.meta && to.meta.title ? to.meta.title : "DGR";
  document.title = pageTitle;
});

export default router;
