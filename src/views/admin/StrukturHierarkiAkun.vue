<template>
  <div class="page">

    <!-- ── TOP HEADER ─────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Struktur akun</h1>
      </div>
      <div class="header-right">
        <div class="total-chip">{{ compact ? '' : 'Total: ' }}{{ rawData.length }} akun</div>
        <button class="hdr-btn" title="Tutup Semua" aria-label="Tutup Semua" @click="collapseAll">
          <v-icon size="16">mdi-unfold-less-horizontal</v-icon><span class="hdr-btn-teks">Tutup Semua</span>
        </button>
        <button class="hdr-btn hdr-btn--open" title="Buka Semua" aria-label="Buka Semua" @click="expandAll">
          <v-icon size="16">mdi-unfold-more-horizontal</v-icon><span class="hdr-btn-teks">Buka Semua</span>
        </button>
        <router-link v-if="superadmin" to="/admin/struktur-excel" class="hdr-btn" title="Excel Struktur" aria-label="Excel Struktur">
          <v-icon size="16">mdi-microsoft-excel</v-icon><span class="hdr-btn-teks">Excel</span>
        </router-link>
      </div>
    </div>

    <!-- ── ROLE STAT CARDS ─────────────────────────────────────────────────── -->
    <div class="stat-row">
      <div v-for="role in ROLE_ORDER" :key="role" class="stat-card" :style="{
        borderTopColor: ROLE_COLORS[role],
        background: activeRoleFilter === role ? ROLE_COLORS[role] : '#18181b',
      }" @click="onRoleCardClick(role)">
        <div class="stat-label" :style="{ color: activeRoleFilter === role ? '#fff' : ROLE_COLORS[role] }">{{
          compact ? (ROLE_SINGKAT[role] || role) : getDisplayRole(role) }}
        </div>
        <div class="stat-value" :style="{ color: activeRoleFilter === role ? '#fff' : ROLE_COLORS[role] }">{{
          roleCounts[role] ?? 0 }}</div>
      </div>
    </div>

    <!-- ── MAIN BODY ───────────────────────────────────────────────────────── -->
    <div class="body">

      <!-- Tree Panel -->
      <div class="tree-panel">
        <div class="tree-topbar">
          <span class="topbar-title" :class="{ 'topbar-title--kosong': !activeRoleFilter }">
            akun Hierarki
            <v-chip v-if="activeRoleFilter" size="x-small" closable
              :style="{ background: ROLE_COLORS[activeRoleFilter] + '22', color: ROLE_COLORS[activeRoleFilter], border: `1px solid ${ROLE_COLORS[activeRoleFilter]}55` }"
              @click:close="onRoleCardClick(activeRoleFilter)">{{ getDisplayRole(activeRoleFilter) }}</v-chip>
          </span>
          <v-text-field v-model="searchQuery" density="compact" variant="outlined" hide-details theme="dark"
            class="cari-struktur" placeholder="Cari nama / No ID..." prepend-inner-icon="mdi-magnify"
            @update:modelValue="onSearch">
            <template #append-inner>
              <v-btn variant="tonal" size="x-small" style="margin-right:-4px;" @click="clearSearch">Semua</v-btn>
            </template>
          </v-text-field>
        </div>

        <div v-if="loading" class="state-center">
          <v-progress-circular indeterminate color="primary" size="26" />
          <span>Memuat data...</span>
        </div>

        <div v-else-if="error" class="state-center state-error">
          <v-icon size="32">mdi-alert-circle-outline</v-icon>
          <span>{{ error }}</span>
          <v-btn variant="tonal" color="primary" size="small" @click="fetchData">Coba Lagi</v-btn>
        </div>

        <div v-else class="tree-scroll">
          <template v-if="filteredRoots.length">
            <TreeNode v-for="node in filteredRoots" :key="node.id" :node="node" :depth="0" :selected-id="selectedId"
              :filtered-ids="filteredIds" :role-filtered-ids="roleFilteredIds"
              :search-active="searchQuery.trim().length > 0" :collapse-signal="collapseSignal"
              :expand-signal="expandSignal" :compact="compact" @select="onSelect" />
          </template>
          <div v-else class="state-center"><span>Tidak ada hasil</span></div>
        </div>
      </div>

      <!-- Detail Panel -->
      <!-- HP: panel detail dipindah ke body supaya tampil di atas header & menu bawah aplikasi -->
      <Teleport to="body" :disabled="!compact">
      <div class="detail-panel" :class="{ 'detail-panel--open': mobileDetailOpen }">
        <div class="detail-topbar">
          <span>DETAIL AKUN</span>
          <v-btn class="d-md-none" icon="mdi-close" variant="text" size="small" color="#F6D365"
            aria-label="Tutup detail" @click="closeMobileDetail" />
        </div>

        <template v-if="selected">
          <div class="detail-avatar-row">
            <v-avatar v-if="selected.path_gambar_profile" :image="getImageUrl(selected.path_gambar_profile)" size="60"
              rounded="lg" />
            <v-avatar v-else size="60" rounded="lg" :style="{ background: roleGradient(selected.jabatan) }">
              <span style="font-size:20px; font-weight:700; color:#fff; letter-spacing:1px;">{{ initials(selected.nama)
              }}</span>
            </v-avatar>
          </div>

          <div class="detail-name">{{ selected.nama }}</div>
          <div class="detail-meta">
            <span class="meta-badge" :style="badgeStyle(selected.jabatan)">{{ getDisplayRole(selected.label_jabatan || selected.jabatan) }}</span>
            <span class="noid-chip">No ID {{ selected.no_id || '—' }}</span>
            <span v-if="noMember(selected.id)" class="noid-chip" title="No. Member: nomor tetap akun">{{ noMember(selected.id) }}</span>
            <span class="dot">·</span>
            <span class="meta-small">{{ formatDate(selected.tanggal_bergabung) }}</span>
          </div>

          <div class="detail-stats">
            <div class="dstat-block">
              <div class="dstat-lbl">Downline LANGSUNG</div>
              <div class="dstat-val">{{ selected.children?.length ?? 0 }}</div>
            </div>
            <div class="dstat-block">
              <div class="dstat-lbl">TOTAL JARINGAN</div>
              <div class="dstat-val">{{ selected.jumlah_bawahan }}</div>
            </div>
          </div>

          <div class="detail-row">
            <div class="dcell">
              <div class="dcell-lbl">UPLINE</div>
              <div class="dcell-val">{{ getParentName(selected) }}</div>
              <div v-if="getParent(selected)?.no_id" class="bawahan-noid">{{ getParent(selected).no_id }}</div>
            </div>
            <div class="dcell">
              <div class="dcell-lbl">LEVEL</div>
              <div class="dcell-val dcell-big" :style="{ color: roleColor(selected.jabatan) }">{{ selected.jabatan_level ?? 'Puncak'
              }}</div>
            </div>
          </div>

          <!-- <div class="detail-row" style="border-bottom:none;">
            <div class="dcell">
              <div class="dcell-lbl">DEPTH</div>
              <div class="dcell-val">Kedalaman {{ selected.depth }}</div>
            </div>
            <div class="dcell" style="border-right:none;">
              <div class="dcell-lbl">BERGABUNG</div>
              <div class="dcell-val">{{ formatDate(selected.tanggal_bergabung) }}</div>
            </div>
          </div> -->

          <div v-if="selected.children?.length" class="bawahan-section">
            <div class="bawahan-title">Downline LANGSUNG ({{ selected.children.length }})</div>
            <div v-for="b in selected.children" :key="b.id" class="bawahan-item" @click="onSelect(b)">
              <div class="bawahan-dot" :style="{ background: roleColor(b.jabatan) }"></div>
              <span class="bawahan-name">{{ b.nama }}</span>
              <span class="bawahan-noid">{{ b.no_id }}</span>
              <span class="meta-badge" :style="badgeStyle(b.jabatan)">{{ getDisplayRole(b.label_jabatan || b.jabatan) }}</span>
            </div>
          </div>
        </template>

        <div v-else class="detail-empty">
          <span style="font-size:36px;">👆</span>
          <p>Klik akun di pohon untuk melihat detail</p>
        </div>
      </div>
      </Teleport>

    </div>
  </div>
</template>

<script setup>
import { API_URL, FILE_URL } from "@/config";
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDisplay } from 'vuetify';
import { idDariNoMember, noMember } from '@/utils/noMember';

// HP/tablet (< 960px): baris pohon dua tingkat (nama, lalu jabatan · No ID) dan indentasi lebih kecil
const { smAndDown } = useDisplay();
const compact = computed(() => smAndDown.value);
// Superadmin: pintasan ke menu Excel Struktur (unduh pohon sebagai Excel)
const superadmin = localStorage.getItem("mvo_type_id") === "superadmin";

// OWNER = puncak di atas Top Management (akun Owner, No ID OW01) — akar pohon dari backend
const ROLE_ORDER = ['OWNER', 'TOP MANAGEMENT', 'MVO', 'REGIONAL', 'FOUNDER', 'GENERAL MANAGER', 'SUPPLIER', 'DISTRIBUTOR', 'RESELLER'];
// Label pendek untuk kartu total di HP (grid 4 kolom)
const ROLE_SINGKAT = { 'TOP MANAGEMENT': 'TM', 'GENERAL MANAGER': 'GM', 'DISTRIBUTOR': 'DIST', 'REGIONAL': 'RGO' };
const ROLE_COLORS = {
  'MVO': '#ef4444', 'REGIONAL': '#f97316', 'FOUNDER': '#a855f7',
  'OWNER': '#F6D365', 'TOP MANAGEMENT': '#E6B422',   'GENERAL MANAGER': '#22d3ee', 'SUPPLIER': '#3b82f6', 'DISTRIBUTOR': '#10b981', 'RESELLER': '#6b7280',
};

const rawData = ref([]);
const treeRoots = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedId = ref(null);
const selected = ref(null);
const searchQuery = ref('');
const filteredIds = ref(new Set());
const collapseSignal = ref(0);
const expandSignal = ref(0);
const activeRoleFilter = ref(null);
const mobileDetailOpen = ref(false);

const roleCounts = computed(() => {
  const counts = {};
  rawData.value.forEach(n => { const j = n.jabatan?.toUpperCase(); counts[j] = (counts[j] ?? 0) + 1; });
  return counts;
});

const roleFilteredIds = computed(() => {
  if (!activeRoleFilter.value) return null;
  const ids = new Set();
  rawData.value.forEach(n => { if (n.jabatan?.toUpperCase() === activeRoleFilter.value) ids.add(n.id); });
  return ids;
});

const filteredRoots = computed(() => {
  const roots = treeRoots.value;
  if (!searchQuery.value.trim() && !activeRoleFilter.value) return roots;
  if (searchQuery.value.trim()) return roots.filter(r => hasDesc(r, filteredIds.value));
  return roots.filter(r => hasDesc(r, roleFilteredIds.value));
});

async function fetchData() {
  loading.value = true; error.value = null;
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_URL}/api/mvo/pohon-struktur`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    rawData.value = res.data.data ?? [];
    treeRoots.value = buildTree(rawData.value);
  } catch (e) {
    error.value = e.response?.status === 404 ? 'Endpoint tidak ditemukan.' : 'Gagal memuat data. Periksa koneksi.';
  } finally { loading.value = false; }
}

function buildTree(flat) {
  const map = {};
  flat.forEach(n => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  flat.forEach(n => {
    if (n.parent_id && map[n.parent_id]) map[n.parent_id].children.push(map[n.id]);
    else if (!n.parent_id) roots.push(map[n.id]);
  });
  return roots;
}

function collectMatchIds(nodes, query, result = new Set()) {
  const idMember = idDariNoMember(query); // "BP-00284" → akun 284
  for (const n of nodes) {
    if (idMember ? Number(n.id) === idMember
      : n.nama.toLowerCase().includes(query.toLowerCase()) || (n.no_id || "").toLowerCase().includes(query.toLowerCase())) result.add(n.id);
    if (n.children?.length) collectMatchIds(n.children, query, result);
  }
  return result;
}

function hasDesc(node, ids) {
  if (ids.has(node.id)) return true;
  return node.children?.some(c => hasDesc(c, ids)) ?? false;
}

function onSearch() {
  const q = searchQuery.value.trim();
  filteredIds.value = q ? collectMatchIds(treeRoots.value, q) : new Set();
  if (q) activeRoleFilter.value = null;
}

function clearSearch() { searchQuery.value = ''; filteredIds.value = new Set(); }

function onRoleCardClick(role) {
  if (activeRoleFilter.value === role) { activeRoleFilter.value = null; }
  else { activeRoleFilter.value = role; expandSignal.value++; searchQuery.value = ''; filteredIds.value = new Set(); }
}

function collapseAll() { collapseSignal.value++; }
function expandAll() { expandSignal.value++; }
function onSelect(node) { selectedId.value = node.id; selected.value = node; mobileDetailOpen.value = true; }
function closeMobileDetail() { mobileDetailOpen.value = false; }

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('https')) return path;
  return `${FILE_URL}/${path.startsWith('/') ? path.substring(1) : path}`;
}
function getParentName(node) {
  // Akun tanpa upline langsung di bawah Owner (backend); yang tanpa parent hanya Owner sendiri
  if (!node.parent_id) return '—';
  return getParent(node)?.nama ?? '—';
}
function getParent(node) {
  if (!node.parent_id) return null;
  return rawData.value.find(r => String(r.id) === String(node.parent_id)) ?? null;
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function roleColor(role) { return ROLE_COLORS[role?.toUpperCase()] || '#6b7280'; }
function roleGradient(role) { const c = roleColor(role); return `linear-gradient(135deg, ${c}dd, ${c}88)`; }
function badgeStyle(role) { const c = roleColor(role); return { background: c + '18', color: c, border: `1px solid ${c}40` }; }
function formatDate(dt) { if (!dt) return '—'; return dt.split(' ')[0]; }

function getDisplayRole(role) {
  if (!role) return '';
  return role.toString().toUpperCase() === 'RESELLER' ? 'RESELLER' : role;
}

// ─── TreeNode ─────────────────────────────────────────────────────────────────
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object, depth: Number, selectedId: [String, Number],
    filteredIds: Object, roleFilteredIds: Object, searchActive: Boolean,
    collapseSignal: Number, expandSignal: Number, compact: Boolean,
  },
  emits: ['select'],
  setup(props, { emit }) {
    // Owner (0) → TM (1) → MVO (2) terbuka saat halaman dibuka
    const open = ref(Number(props.node?.depth ?? 0) < 3);
    let prevCollapse = props.collapseSignal;
    let prevExpand = props.expandSignal;

    function isVisible() {
      if (props.roleFilteredIds) return hasDescLocal(props.node, props.roleFilteredIds);
      if (!props.searchActive) return true;
      return hasDescLocal(props.node, props.filteredIds);
    }
    function hasDescLocal(node, ids) {
      if (ids.has(node.id)) return true;
      return node.children?.some(c => hasDescLocal(c, ids)) ?? false;
    }
    function toggle(e) { e.stopPropagation(); open.value = !open.value; }

    return () => {
      if (props.collapseSignal !== prevCollapse) { prevCollapse = props.collapseSignal; open.value = false; }
      if (props.expandSignal !== prevExpand) { prevExpand = props.expandSignal; open.value = true; }
      if (!isVisible()) return null;

      const node = props.node;
      const hasChildren = node.children?.length > 0;
      // Saat mencari, cabang yang berisi hasil pencarian otomatis terbuka
      const terbuka = open.value || (props.searchActive && hasChildren && node.children.some(ch => hasDescLocal(ch, props.filteredIds)));
      const isSelected = String(props.selectedId) === String(node.id);
      const isMatch = props.searchActive && props.filteredIds.has(node.id);
      const isRoleMatch = props.roleFilteredIds ? props.roleFilteredIds.has(node.id) : false;
      const color = ROLE_COLORS[node.jabatan?.toUpperCase()] || '#6b7280';

      let rowBg = 'transparent';
      if (isSelected) rowBg = 'rgba(37, 99, 235, 0.15)';
      else if (isMatch) rowBg = 'rgba(245, 158, 11, 0.15)';
      else if (isRoleMatch) rowBg = 'rgba(16, 185, 129, 0.15)';

      let leftColor = 'transparent';
      if (isSelected) leftColor = '#2563eb';
      else if (isMatch) leftColor = '#f59e0b';
      else if (isRoleMatch) leftColor = '#10b981';

      const c = props.compact;
      const rowStyle = {
        display: 'flex', alignItems: 'center', gap: c ? '8px' : '12px',
        padding: c ? `8px 12px 8px ${6 + props.depth * 14}px` : `8px 20px 8px ${18 + props.depth * 24}px`,
        cursor: 'pointer', minHeight: '54px', userSelect: 'none',
        background: rowBg, borderLeft: `4px solid ${leftColor}`,
        borderBottom: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box',
        transition: 'background 0.12s',
      };

      const badgeSty = {
        fontSize: c ? '9.5px' : '10px', fontWeight: '700', padding: c ? '1px 7px' : '2px 9px', borderRadius: '10px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '0', letterSpacing: '0.4px',
        background: color + '18', color, border: `1px solid ${color}40`,
      };

      const nameSty = {
        fontSize: '13.5px',
        color: isSelected ? '#60a5fa' : (isMatch ? '#fbbf24' : '#e5e7eb'),
        fontWeight: isSelected ? '600' : (isMatch || isRoleMatch ? '500' : '400'),
        flex: '1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '0',
      };

      const countSty = {
        fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
        color: '#9ca3af', background: '#27272a', border: '1px solid rgba(255,255,255,0.12)',
        padding: c ? '2px 8px' : '2px 10px', borderRadius: '10px', flexShrink: '0', minWidth: '34px', textAlign: 'center',
      };

      const noIdSty = {
        fontSize: c ? '11.5px' : '12px', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--baba-gold-light)', whiteSpace: 'nowrap', flexShrink: '0',
      };

      const jabatan = getDisplayRole(node.label_jabatan || node.jabatan);
      // Dua tingkat (HP & desktop): jabatan + No ID di atas, nama di bawah
      const isi = [h('div', { style: { flex: '1', minWidth: '0' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' } }, [
          h('span', { style: badgeSty }, jabatan),
          node.no_id ? h('span', { style: noIdSty }, node.no_id) : null,
        ]),
        h('div', { style: { ...nameSty, display: 'block', fontSize: '14px', marginTop: '3px' } }, node.nama),
      ])];

      return h('div', { style: { width: '100%' } }, [
        h('div', {
          style: rowStyle,
          onClick: () => emit('select', node),
          onMouseenter: e => { if (!isSelected && !isMatch && !isRoleMatch) e.currentTarget.style.background = '#27272a'; },
          onMouseleave: e => { e.currentTarget.style.background = rowBg; },
        }, [
          h('div', {
            style: { width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: '0', cursor: hasChildren ? 'pointer' : 'default' },
            onClick: hasChildren ? toggle : undefined,
          }, hasChildren ? h('svg', {
            width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '3',
            style: { transform: terbuka ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.17s ease', display: 'block' },
          }, [h('path', { d: 'M9 18l6-6-6-6' })]) : null),
          ...isi,
          Number(node.jumlah_bawahan) > 0 ? h('span', { style: countSty }, String(node.jumlah_bawahan)) : null,
        ]),
        hasChildren && terbuka
          ? h('div', null, node.children.map(child =>
            h(TreeNode, {
              key: child.id, node: child, depth: props.depth + 1,
              selectedId: props.selectedId, filteredIds: props.filteredIds,
              roleFilteredIds: props.roleFilteredIds, searchActive: props.searchActive,
              collapseSignal: props.collapseSignal, expandSignal: props.expandSignal,
              compact: props.compact,
              onSelect: n => emit('select', n),
            })
          ))
          : null,
      ]);
    };
  },
});

onMounted(fetchData);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap');

/* .v-icon dikecualikan supaya font ikon (mdi) tidak tertimpa */
*:not(.v-icon),
*:not(.v-icon)::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Outfit', sans-serif;
}

/* tombol buka semua*/
.hdr-btn--open {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(29, 78, 216, 0.25);
}

.hdr-btn--open:hover {
  background: #1e40af;
  border-color: #1e40af;
}

a.hdr-btn {
  text-decoration: none;
}

/* ── Root: fullscreen ────────────────────────────────────────────────────── */
/* Pas satu layar: 96px = header aplikasi (65) + jarak atas & bawah. Pohon digulir di dalam kotaknya sendiri. */
.page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 96px);
  height: calc(100dvh - 96px);
  min-height: 520px;
  overflow: hidden;
  background: #09090b;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #18181b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #f3f4f6;
}

/* ── Stat cards ──────────────────────────────────────────────────────────── */
.stat-row {
  display: flex;
  gap: 12px;
  padding: 14px 24px;
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.stat-row::-webkit-scrollbar {
  display: none;
}

.stat-card {
  flex: 1;
  min-width: 96px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-width: 3px;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

/* ── Body ────────────────────────────────────────────────────────────────── */
.body {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0 24px 24px;
  gap: 14px;
}

/* ── Tree Panel ──────────────────────────────────────────────────────────── */
.tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
}

.tree-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
  background: #27272a;
  gap: 12px;
  flex-wrap: wrap;
}

.topbar-title {
  font-size: 13px;
  font-weight: 700;
  color: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--baba-gold-dark) transparent;
}

.tree-scroll::-webkit-scrollbar {
  width: 6px;
}

.tree-scroll::-webkit-scrollbar-thumb {
  background: var(--baba-gold-dark);
  border-radius: 3px;
}

/* ── States ──────────────────────────────────────────────────────────────── */
.state-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #9ca3af;
  font-size: 13px;
}

.state-error {
  color: #ef4444;
}

/* ── Detail Panel ────────────────────────────────────────────────────────── */
.detail-panel {
  width: 300px;
  flex-shrink: 0;
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}

.detail-panel::-webkit-scrollbar {
  width: 4px;
}

.detail-panel::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 2px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 4px 8px 4px 18px;
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 1.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: #27272a;
  flex-shrink: 0;
}

.detail-avatar-row {
  padding: 22px 18px 10px;
  display: flex;
  align-items: center;
}

.detail-name {
  padding: 0 18px 6px;
  font-size: 18px;
  font-weight: 700;
  color: #f3f4f6;
}

.detail-meta {
  padding: 0 18px 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 10px;
  letter-spacing: 0.4px;
}

.dot {
  color: #4b5563;
}

.noid-chip {
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--baba-gold-light);
  background: rgba(230, 180, 34, 0.12);
  border: 1px solid rgba(230, 180, 34, 0.35);
  padding: 2px 9px;
  border-radius: 10px;
}

.bawahan-noid {
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--baba-gold-light);
  flex-shrink: 0;
}

.cari-struktur {
  max-width: 260px;
  flex-shrink: 0;
}

.cari-struktur :deep(input) {
  color: #f3f4f6;
}

.cari-struktur :deep(input::placeholder) {
  color: #9ca3af;
  opacity: 1;
}

.cari-struktur :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.meta-small {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'JetBrains Mono', monospace;
}

.detail-stats {
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.dstat-block {
  flex: 1;
  padding: 14px 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.dstat-block:last-child {
  border-right: none;
}

.dstat-lbl {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.dstat-val {
  font-size: 26px;
  font-weight: 700;
  color: #1d4ed8;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.dcell {
  flex: 1;
  padding: 12px 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.dcell:last-child {
  border-right: none;
}

.dcell-lbl {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.dcell-val {
  font-size: 12.5px;
  color: #e5e7eb;
  font-weight: 500;
  word-break: break-word;
}

.dcell-big {
  font-size: 20px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.bawahan-section {
  padding: 14px 18px;
}

.bawahan-title {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 9px;
}

.bawahan-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 9px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 2px;
}

.bawahan-item:hover {
  background: #27272a;
}

.bawahan-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bawahan-name {
  flex: 1;
  font-size: 12.5px;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
  padding: 24px;
}

/* ── HP & tablet (< 960px, sama dengan breakpoint md Vuetify) ─────────────── */
@media (max-width: 959px) {
  /* Pas satu layar di atas menu bawah: 152px = header (61) + menu bawah (64) + jarak.
     Header & kartu tetap terlihat, hanya pohon yang digulir. */
  .page {
    height: calc(100vh - 152px);
    height: calc(100dvh - 152px);
    min-height: 460px;
    border-radius: 12px;
  }

  .page-header {
    flex-wrap: nowrap;
    gap: 8px;
    padding: 10px 12px;
  }

  .page-title {
    font-size: 16px;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  /* diawali .page-header karena aturan dasarnya ditulis setelah blok ini */
  .page-header .header-right {
    gap: 6px;
  }

  .page-header .total-chip {
    padding: 4px 10px;
    font-size: 11px;
    white-space: nowrap;
  }

  /* Tombol Tutup/Buka Semua jadi ikon saja */
  .page-header .hdr-btn {
    padding: 6px 9px;
  }

  .hdr-btn-teks {
    display: none;
  }

  /* Semua kartu total terlihat: grid 5 kolom × 2 baris (Owner … Reseller) */
  .stat-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    padding: 8px 12px;
    overflow: visible;
  }

  .stat-card {
    min-width: 0;
    padding: 6px 5px;
    border-radius: 8px;
    border-top-width: 2px;
  }

  .stat-card:hover {
    transform: none;
  }

  .stat-label {
    font-size: 9px;
    letter-spacing: 0;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-value {
    font-size: 17px;
  }

  .topbar-title--kosong {
    display: none;
  }

  .body {
    padding: 0 8px 8px;
  }

  .tree-topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px 12px;
  }

  .cari-struktur {
    max-width: none;
  }

  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100% !important;
    /* di atas header & menu bawah aplikasi */
    z-index: 2100;
    border-radius: 0;
    border: none;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .detail-panel--open {
    transform: translateX(0);
  }

  .detail-topbar {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-chip {
  font-size: 12px;
  color: #e5e7eb;
  background: #27272a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 5px 14px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
}

.hdr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #27272a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.5px;
  transition: all 0.15s;
  box-shadow: var(--shadow-sm);
}
</style>