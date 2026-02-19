<template>
  <div class="page">

    <!-- ── TOP HEADER ─────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Data Hierarki akun</h1>
      </div>
      <div class="header-right">
        <div class="total-chip">Total: {{ rawData.length }} akun</div>
        <button class="hdr-btn" @click="collapseAll">Tutup Semua</button>
        <button class="hdr-btn hdr-btn--open" @click="expandAll">Buka Semua</button>
      </div>
    </div>

    <!-- ── ROLE STAT CARDS ─────────────────────────────────────────────────── -->
    <div class="stat-row">
      <div v-for="role in ROLE_ORDER" :key="role" class="stat-card"
        :class="{ 'stat-card--active': activeRoleFilter === role }" :style="{
          borderTopColor: ROLE_COLORS[role],
          background: activeRoleFilter === role ? ROLE_COLORS[role] : ''
        }" @click="onRoleCardClick(role)">
        <div class="stat-card-label" :style="{ color: activeRoleFilter === role ? '#ffffff' : ROLE_COLORS[role] }">{{
          role }}</div>
        <div class="stat-card-value" :style="{ color: activeRoleFilter === role ? '#ffffff' : ROLE_COLORS[role] }">
          {{ roleCounts[role] ?? 0 }}
        </div>
      </div>
    </div>

    <!-- ── MAIN BODY ───────────────────────────────────────────────────────── -->
    <div class="body">

      <!-- Tree Panel -->
      <div class="tree-panel">
        <div class="tree-topbar">
          <span class="tree-topbar-title">
            akun Hierarki
            <span v-if="activeRoleFilter" class="active-filter-chip"
              :style="{ background: ROLE_COLORS[activeRoleFilter] + '22', color: ROLE_COLORS[activeRoleFilter], borderColor: ROLE_COLORS[activeRoleFilter] + '55' }">
              {{ activeRoleFilter }}
              <span class="chip-close" @click.stop="onRoleCardClick(activeRoleFilter)">✕</span>
            </span>
          </span>
          <div class="search-box" :class="{ focused: searchFocused }">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Cari nama..." @input="onSearch"
              @focus="searchFocused = true" @blur="searchFocused = false" />
            <button class="search-all-btn" @click="clearSearch">Semua</button>
          </div>
        </div>

        <div v-if="loading" class="center-state">
          <div class="spinner"></div>
          <span>Memuat data...</span>
        </div>

        <div v-else-if="error" class="center-state error-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <span>{{ error }}</span>
          <button class="retry-btn" @click="fetchData">Coba Lagi</button>
        </div>

        <div v-else class="tree-scroll">
          <template v-if="filteredRoots.length">
            <TreeNode v-for="node in filteredRoots" :key="node.id" :node="node" :depth="0" :selected-id="selectedId"
              :filtered-ids="filteredIds" :role-filtered-ids="roleFilteredIds"
              :search-active="searchQuery.trim().length > 0" :collapse-signal="collapseSignal"
              :expand-signal="expandSignal" @select="onSelect" />
          </template>
          <div v-else class="center-state"><span>Tidak ada hasil</span></div>
        </div>
      </div>

      <!-- Detail Panel -->
      <div class="detail-panel" :class="{ 'detail-panel--mobile-open': mobileDetailOpen }">
        <div class="detail-header-bar">
          <span>Detail Akun</span>
        </div>

        <template v-if="selected">
          <div class="detail-avatar-row">
            <img v-if="selected.path_gambar_profile" :src="getImageUrl(selected.path_gambar_profile)"
              class="detail-avatar-img" alt="Profile" />

            <div v-else class="detail-avatar" :style="{ background: roleGradient(selected.jabatan) }">
              {{ initials(selected.nama) }}
            </div>
            <button class="mobile-close-btn" @click="closeMobileDetail">✕</button>

          </div>

          <div class="detail-name">{{ selected.nama }}</div>
          <div class="detail-meta">
            <span class="meta-badge" :style="badgeStyle(selected.jabatan)">{{ selected.jabatan }}</span>
            <span class="dot-sep">·</span>
            <span class="meta-small">ID: {{ selected.no_id }}</span>
            <span class="dot-sep">·</span>
            <span class="meta-small">{{ formatDate(selected.tanggal_bergabung) }}</span>
          </div>

          <div class="detail-stats">
            <div class="stat-block">
              <div class="stat-lbl">BAWAHAN LANGSUNG</div>
              <div class="stat-val">{{ selected.children?.length ?? 0 }}</div>
            </div>
            <div class="stat-block">
              <div class="stat-lbl">TOTAL JARINGAN</div>
              <div class="stat-val">{{ selected.jumlah_bawahan }}</div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-cell">
              <div class="cell-lbl">ATASAN</div>
              <div class="cell-val">{{ getParentName(selected) }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-lbl">LEVEL</div>
              <div class="cell-val cell-highlight" :style="{ color: roleColor(selected.jabatan) }">
                {{ selected.jabatan_level }}
              </div>
            </div>
          </div>

          <div class="detail-row" style="border-bottom:none">
            <div class="detail-cell">
              <div class="cell-lbl">DEPTH</div>
              <div class="cell-val">Kedalaman {{ selected.depth }}</div>
            </div>
            <div class="detail-cell" style="border-right:none">
              <div class="cell-lbl">BERGABUNG</div>
              <div class="cell-val">{{ formatDate(selected.tanggal_bergabung) }}</div>
            </div>
          </div>

          <div class="bawahan-section" v-if="selected.children?.length">
            <div class="bawahan-title">BAWAHAN LANGSUNG ({{ selected.children.length }})</div>
            <div v-for="b in selected.children" :key="b.id" class="bawahan-item" @click="onSelect(b)">
              <div class="bawahan-dot" :style="{ background: roleColor(b.jabatan) }"></div>
              <span class="bawahan-name">{{ b.nama }}</span>
              <span class="bawahan-badge" :style="badgeStyle(b.jabatan)">{{ b.jabatan }}</span>
            </div>
          </div>
        </template>

        <div v-else class="detail-empty">
          <div class="empty-hand">👆</div>
          <p>Klik akun di pohon untuk melihat detail</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_ORDER = ['MVO', 'REGIONAL', 'FOUNDER', 'GENERAL MANAGER', 'SUPPLIER', 'DISTRIBUTOR', 'SELLER'];
const ROLE_COLORS = {
  'MVO': '#ef4444',
  'REGIONAL': '#f97316',
  'FOUNDER': '#a855f7',
  'GENERAL MANAGER': '#22d3ee',
  'SUPPLIER': '#3b82f6',
  'DISTRIBUTOR': '#10b981',
  'SELLER': '#6b7280',
};

// ─── State ────────────────────────────────────────────────────────────────────
const rawData = ref([]);
const treeRoots = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedId = ref(null);
const selected = ref(null);
const searchQuery = ref('');
const searchFocused = ref(false);
const filteredIds = ref(new Set());
const collapseSignal = ref(0);
const expandSignal = ref(0);
const activeRoleFilter = ref(null);
const mobileDetailOpen = ref(false);

// ─── Computed ─────────────────────────────────────────────────────────────────
const roleCounts = computed(() => {
  const counts = {};
  rawData.value.forEach(n => {
    const j = n.jabatan?.toUpperCase();
    counts[j] = (counts[j] ?? 0) + 1;
  });
  return counts;
});

const roleFilteredIds = computed(() => {
  if (!activeRoleFilter.value) return null;
  const ids = new Set();
  rawData.value.forEach(n => {
    if (n.jabatan?.toUpperCase() === activeRoleFilter.value) ids.add(n.id);
  });
  return ids;
});

const filteredRoots = computed(() => {
  const roots = treeRoots.value;
  if (!searchQuery.value.trim() && !activeRoleFilter.value) return roots;
  if (searchQuery.value.trim()) return roots.filter(r => hasDesc(r, filteredIds.value));
  return roots.filter(r => hasDesc(r, roleFilteredIds.value));
});

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const token = Cookies.get('token');
    const res = await axios.get('https://babaapi.teknosof.com/api/mvo/pohon-struktur', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    rawData.value = res.data.data ?? [];
    treeRoots.value = buildTree(rawData.value);
  } catch (e) {
    error.value = e.response?.status === 404
      ? 'Endpoint tidak ditemukan.'
      : 'Gagal memuat data. Periksa koneksi.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// ─── Build Tree ───────────────────────────────────────────────────────────────
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

// ─── Search ───────────────────────────────────────────────────────────────────
function collectMatchIds(nodes, query, result = new Set()) {
  for (const n of nodes) {
    if (n.nama.toLowerCase().includes(query.toLowerCase()) ||
      n.no_id.toLowerCase().includes(query.toLowerCase())) result.add(n.id);
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

function clearSearch() {
  searchQuery.value = '';
  filteredIds.value = new Set();
}

function onRoleCardClick(role) {
  if (activeRoleFilter.value === role) {
    activeRoleFilter.value = null;
  } else {
    activeRoleFilter.value = role;
    expandSignal.value++;
    searchQuery.value = '';
    filteredIds.value = new Set();
  }
}

function collapseAll() { collapseSignal.value++; }
function expandAll() { expandSignal.value++; }

function onSelect(node) {
  selectedId.value = node.id;
  selected.value = node;
  mobileDetailOpen.value = true;
}

function closeMobileDetail() {
  mobileDetailOpen.value = false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('https')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `https://babaapi.teknosof.com/project/public/${cleanPath}`;
}

function getParentName(node) {
  if (!node.parent_id) return '—';
  const parent = rawData.value.find(r => r.id === node.parent_id);
  return parent?.nama ?? '—';
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function roleColor(role) {
  return ROLE_COLORS[role?.toUpperCase()] || '#6b7280';
}

function roleGradient(role) {
  const c = roleColor(role);
  return `linear-gradient(135deg, ${c}dd, ${c}88)`;
}

function badgeStyle(role) {
  const c = roleColor(role);
  return { background: c + '18', color: c, border: `1px solid ${c}40` };
}

function formatDate(dt) {
  if (!dt) return '—';
  return dt.split(' ')[0];
}

// ─── TreeNode ─────────────────────────────────────────────────────────────────
// PENTING: Semua style pakai INLINE karena scoped CSS tidak berlaku untuk
// komponen yang di-render via h() / render function di Vue.
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    depth: Number,
    selectedId: [String, Number],
    filteredIds: Object,
    roleFilteredIds: Object,
    searchActive: Boolean,
    collapseSignal: Number,
    expandSignal: Number,
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(Number(props.node?.depth ?? 0) < 2);
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

    function toggle(e) {
      e.stopPropagation();
      open.value = !open.value;
    }

    return () => {
      // Handle signals
      if (props.collapseSignal !== prevCollapse) { prevCollapse = props.collapseSignal; open.value = false; }
      if (props.expandSignal !== prevExpand) { prevExpand = props.expandSignal; open.value = true; }
      if (!isVisible()) return null;

      const node = props.node;
      const hasChildren = node.children?.length > 0;
      const isSelected = String(props.selectedId) === String(node.id);
      const isMatch = props.searchActive && props.filteredIds.has(node.id);
      const isRoleMatch = props.roleFilteredIds ? props.roleFilteredIds.has(node.id) : false;
      const color = ROLE_COLORS[node.jabatan?.toUpperCase()] || '#6b7280';

      // ── Warna latar baris ──
      let rowBg = 'transparent';
      if (isSelected) rowBg = '#eff6ff';
      else if (isMatch) rowBg = '#fefce8';
      else if (isRoleMatch) rowBg = '#f0fdf4';

      // ── Warna garis kiri ──
      let leftColor = 'transparent';
      if (isSelected) leftColor = '#2563eb';
      else if (isMatch) leftColor = '#f59e0b';
      else if (isRoleMatch) leftColor = '#10b981';

      // ── Style ROW ──
      const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '11px',
        paddingBottom: '11px',
        paddingLeft: `${18 + props.depth * 24}px`,
        paddingRight: '20px',
        cursor: 'pointer',
        position: 'relative',
        minHeight: '46px',
        userSelect: 'none',
        background: rowBg,
        borderLeft: `4px solid ${leftColor}`,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        transition: 'background 0.12s',
      };

      // ── Style TOGGLE ──
      const toggleStyle = {
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        flexShrink: '0',
        cursor: hasChildren ? 'pointer' : 'default',
        borderRadius: '4px',
      };

      // ── Style BADGE ──
      const badgeSty = {
        fontSize: '10px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '10px',
        whiteSpace: 'nowrap',
        flexShrink: '0',
        letterSpacing: '0.4px',
        minWidth: '105px',
        textAlign: 'center',
        background: color + '18',
        color: color,
        border: `1px solid ${color}40`,
        boxSizing: 'border-box',
      };

      // ── Style NAMA ──
      const nameSty = {
        fontSize: '13.5px',
        color: isSelected ? '#1d4ed8' : (isMatch ? '#92400e' : '#374151'),
        fontWeight: isSelected ? '600' : (isMatch || isRoleMatch ? '500' : '400'),
        flex: '1',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: '0',
      };

      // ── Style COUNT ──
      const countSty = {
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#9ca3af',
        background: '#f3f4f6',
        border: '1px solid rgba(0,0,0,0.12)',
        padding: '2px 10px',
        borderRadius: '10px',
        flexShrink: '0',
        minWidth: '34px',
        textAlign: 'center',
      };

      return h('div', { style: { width: '100%' } }, [
        // ── ROW ──
        h('div', {
          style: rowStyle,
          onClick: () => emit('select', node),
          onMouseenter: (e) => {
            if (!isSelected && !isMatch && !isRoleMatch)
              e.currentTarget.style.background = '#f3f4f6';
          },
          onMouseleave: (e) => {
            e.currentTarget.style.background = rowBg;
          },
        }, [
          // Toggle
          h('div', {
            style: toggleStyle,
            onClick: hasChildren ? toggle : undefined,
          }, hasChildren
            ? h('svg', {
              width: 10, height: 10, viewBox: '0 0 24 24',
              fill: 'none', stroke: 'currentColor', 'stroke-width': '3',
              style: {
                transform: open.value ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.17s ease',
                display: 'block',
              },
            }, [h('path', { d: 'M9 18l6-6-6-6' })])
            : null
          ),

          // Badge jabatan
          h('span', { style: badgeSty }, node.jabatan),

          // Nama
          h('span', { style: nameSty }, node.nama),

          // Jumlah bawahan
          Number(node.jumlah_bawahan) > 0
            ? h('span', { style: countSty }, String(node.jumlah_bawahan))
            : null,
        ]),

        // ── CHILDREN ──
        hasChildren && open.value
          ? h('div', null,
            node.children.map(child =>
              h(TreeNode, {
                key: child.id,
                node: child,
                depth: props.depth + 1,
                selectedId: props.selectedId,
                filteredIds: props.filteredIds,
                roleFilteredIds: props.roleFilteredIds,
                searchActive: props.searchActive,
                collapseSignal: props.collapseSignal,
                expandSignal: props.expandSignal,
                onSelect: (n) => emit('select', n),
              })
            )
          )
          : null,
      ]);
    };
  },
});

onMounted(fetchData);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page {
  --bg-page: #f0f2f7;
  --bg-panel: #ffffff;
  --bg-panel-alt: #f8f9fc;
  --border: rgba(0, 0, 0, 0.07);
  --border-strong: rgba(0, 0, 0, 0.12);
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #9ca3af;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-page);
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

/* ── Page Header ──────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-chip {
  font-size: 12px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid var(--border-strong);
  padding: 5px 14px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
}

.hdr-btn {
  background: #ffffff;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
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

.hdr-btn:hover {
  background: #f3f4f6;
  border-color: #6b7280;
  color: var(--text-primary);
}

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

/* ── Stat Row ─────────────────────────────────────────────────────────────── */
.stat-row {
  display: flex;
  gap: 10px;
  padding: 14px 24px;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-top-width: 3px;
  border-radius: 10px;
  padding: 12px 14px;
  min-width: 0;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card--active {
  box-shadow: var(--shadow-md), 0 0 0 2px rgba(0, 0, 0, 0.1) inset;
}

.stat-card-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.body {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0 24px 24px;
  gap: 0;
}

/* ── Tree Panel ───────────────────────────────────────────────────────────── */
.tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-right: 14px;
  box-shadow: var(--shadow-sm);
}

.tree-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg-panel-alt);
}

.tree-topbar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px 2px 9px;
  border-radius: 10px;
  border: 1px solid;
  letter-spacing: 0.2px;
}

.chip-close {
  font-size: 9px;
  opacity: 0.6;
  cursor: pointer;
  padding: 0 1px;
  transition: opacity 0.12s;
}

.chip-close:hover {
  opacity: 1;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-page);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 6px 12px;
  width: 240px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-box.focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-box svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  flex: 1;
  min-width: 0;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.search-all-btn {
  background: #e5e7eb;
  border: none;
  color: var(--text-secondary);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.search-all-btn:hover {
  background: #d1d5db;
  color: var(--text-primary);
}

/* ── Tree Scroll ──────────────────────────────────────────────────────────── */
.tree-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.tree-scroll::-webkit-scrollbar {
  width: 4px;
}

.tree-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

/* ── States ───────────────────────────────────────────────────────────────── */
.center-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 48px;
}

.error-state {
  color: #ef4444;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.15s;
}

.retry-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* ── Detail Panel ─────────────────────────────────────────────────────────── */
.detail-panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.detail-panel::-webkit-scrollbar {
  width: 4px;
}

.detail-panel::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.detail-header-bar {
  padding: 14px 18px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel-alt);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-avatar-row {
  padding: 22px 18px 10px;
}

.detail-avatar {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.detail-avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.detail-name {
  padding: 0 18px 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
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

.dot-sep {
  color: #d1d5db;
}

.meta-small {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.detail-stats {
  display: flex;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.stat-block {
  flex: 1;
  padding: 14px 18px;
  border-right: 1px solid var(--border);
}

.stat-block:last-child {
  border-right: none;
}

.stat-lbl {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 5px;
}

.stat-val {
  font-size: 26px;
  font-weight: 700;
  color: #1d4ed8;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.detail-cell {
  flex: 1;
  padding: 12px 18px;
  border-right: 1px solid var(--border);
}

.detail-cell:last-child {
  border-right: none;
}

.cell-lbl {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 5px;
}

.cell-val {
  font-size: 12.5px;
  color: var(--text-secondary);
  font-weight: 500;
  word-break: break-word;
}

.cell-highlight {
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
  color: var(--text-muted);
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
  background: #f3f4f6;
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
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bawahan-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9px;
  white-space: nowrap;
}

.detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
  padding: 24px;
}

.empty-hand {
  font-size: 36px;
}

.mobile-close-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

/* ── Mobile Responsive ────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }


  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .stat-row {
    overflow-x: auto;
    padding: 12px 16px;
    gap: 8px;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .stat-row::-webkit-scrollbar {
    display: none;
  }

  .stat-card {
    min-width: 130px;
    flex: 0 0 auto;
  }

  .body {
    padding: 0 16px 16px;
  }

  .tree-panel {
    margin-right: 0;
  }

  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    border-radius: 0;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .detail-panel--mobile-open {
    transform: translateX(0);
  }

  .mobile-close-btn {
    display: block;
  }

  .tree-topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }
}
</style>