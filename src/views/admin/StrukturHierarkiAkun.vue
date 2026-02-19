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
        <!-- Tree topbar -->
        <div class="tree-topbar">
          <span class="tree-topbar-title">
            Pohon Hierarki
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

        <!-- Loading -->
        <div v-if="loading" class="center-state">
          <div class="spinner"></div>
          <span>Memuat data...</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="center-state error-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <span>{{ error }}</span>
          <button class="retry-btn" @click="fetchData">Coba Lagi</button>
        </div>

        <!-- Tree -->
        <div v-else class="tree-scroll">
          <template v-if="filteredRoots.length">
            <TreeNode v-for="node in filteredRoots" :key="node.id" :node="node" :depth="0" :selected-id="selectedId"
              :filtered-ids="filteredIds" :role-filtered-ids="roleFilteredIds"
              :search-active="searchQuery.trim().length > 0" :collapse-signal="collapseSignal"
              :expand-signal="expandSignal" @select="onSelect" />
          </template>
          <div v-else class="center-state">
            <span>Tidak ada hasil</span>
          </div>
        </div>
      </div>

      <!-- Detail Panel -->
      <div class="detail-panel">
        <div class="detail-header-bar">Detail Akun</div>

        <template v-if="selected">
          <div class="detail-avatar-row">
            <img v-if="selected.path_gambar_profile" :src="getImageUrl(selected.path_gambar_profile)"
              class="detail-avatar-img" alt="Profile" />
            <div v-else class="detail-avatar" :style="{ background: roleGradient(selected.jabatan) }">
              {{ initials(selected.nama) }}
            </div>
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
    if (n.parent_id && map[n.parent_id]) {
      map[n.parent_id].children.push(map[n.id]);
    } else if (!n.parent_id) {
      roots.push(map[n.id]);
    }
  });
  return roots;
}

// ─── Search ───────────────────────────────────────────────────────────────────
function collectMatchIds(nodes, query, result = new Set()) {
  for (const n of nodes) {
    if (
      n.nama.toLowerCase().includes(query.toLowerCase()) ||
      n.no_id.toLowerCase().includes(query.toLowerCase())
    ) result.add(n.id);
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

// ─── Role Card Filter ─────────────────────────────────────────────────────────
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

// ─── Collapse / Expand All ────────────────────────────────────────────────────
function collapseAll() { collapseSignal.value++; }
function expandAll() { expandSignal.value++; }

// ─── Select ───────────────────────────────────────────────────────────────────
function onSelect(node) {
  selectedId.value = node.id;
  selected.value = node;
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

// ─── TreeNode (recursive render fn) ──────────────────────────────────────────
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
      if (props.collapseSignal !== prevCollapse) {
        prevCollapse = props.collapseSignal;
        open.value = false;
      }
      if (props.expandSignal !== prevExpand) {
        prevExpand = props.expandSignal;
        open.value = true;
      }

      if (!isVisible()) return null;

      const node = props.node;
      const hasChildren = node.children?.length > 0;
      const isSelected = String(props.selectedId) === String(node.id);
      const isMatch = props.searchActive && props.filteredIds.has(node.id);
      const isRoleMatch = props.roleFilteredIds ? props.roleFilteredIds.has(node.id) : false;
      const color = ROLE_COLORS[node.jabatan?.toUpperCase()] || '#6b7280';

      return h('div', { class: 'tnode-wrap' }, [
        h('div', {
          class: [
            'tnode-row',
            isSelected && 'tnode-row--sel',
            isMatch && 'tnode-row--match',
            isRoleMatch && 'tnode-row--role-match',
          ],
          style: { paddingLeft: `${14 + props.depth * 24}px` },
          onClick: () => emit('select', node),
        }, [
          h('div', {
            class: ['tnode-toggle', !hasChildren && 'tnode-toggle--empty'],
            onClick: hasChildren ? toggle : undefined,
          }, hasChildren
            ? h('svg', {
              width: 9, height: 9, viewBox: '0 0 24 24',
              fill: 'none', stroke: 'currentColor', 'stroke-width': 3,
              style: { transform: open.value ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.17s ease' },
            }, [h('path', { d: 'M9 18l6-6-6-6' })])
            : null
          ),

          h('span', {
            class: 'tnode-badge',
            style: { background: color + '18', color, border: `1px solid ${color}40` },
          }, node.jabatan),

          h('span', {
            class: [
              'tnode-name',
              isMatch && 'tnode-name--match',
              isRoleMatch && 'tnode-name--role-match',
              isSelected && 'tnode-name--sel',
            ],
          }, node.nama),

          Number(node.jumlah_bawahan) > 0
            ? h('span', { class: 'tnode-count' }, node.jumlah_bawahan)
            : null,
        ]),

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

/* ── Variables ────────────────────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-page);
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

/* ── Page Header ─────────────────────────────────────────────────────────── */
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

/* ── Active Filter Chip ───────────────────────────────────────────────────── */
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
  padding: 4px 0;
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

/* ── Tree Nodes ───────────────────────────────────────────────────────────── */
.tnode-wrap {
  width: 100%;
}

/* ─── PERBAIKAN UTAMA: spacing & selected indicator ─────────────────────── */
.tnode-row {
  display: flex;
  align-items: center;
  gap: 12px;               /* jarak antar elemen lebih besar */
  padding-top: 11px;
  padding-bottom: 11px;
  padding-right: 20px;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s;
  position: relative;
  min-height: 46px;
  user-select: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tnode-row:last-child {
  border-bottom: none;
}

.tnode-row:hover {
  background: #f3f4f6;
}

/* ── SELECTED STATE: biru solid, garis kiri tebal, nama bold biru ───────── */
.tnode-row--sel {
  background: #eff6ff !important;
  box-shadow: inset 0 0 0 0 transparent;
}

.tnode-row--sel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;              /* lebih tebal dari sebelumnya */
  background: #2563eb;
  border-radius: 0 3px 3px 0;
  box-shadow: 2px 0 8px rgba(37, 99, 235, 0.35);
}

.tnode-row--match {
  background: #fefce8 !important;
}

.tnode-row--match::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #f59e0b;
  border-radius: 0 3px 3px 0;
}

.tnode-row--role-match {
  background: #f0fdf4 !important;
}

.tnode-row--role-match::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #10b981;
  border-radius: 0 3px 3px 0;
}

.tnode-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  border-radius: 5px;
  transition: background 0.12s, color 0.12s;
}

.tnode-toggle:not(.tnode-toggle--empty):hover {
  background: #e5e7eb;
  color: var(--text-primary);
}

.tnode-toggle--empty {
  cursor: default;
}

.tnode-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.4px;
  min-width: 90px;         /* lebar tetap agar nama selalu mulai di posisi sama */
  text-align: center;
}

.tnode-name {
  font-size: 13.5px;
  color: var(--text-secondary);
  font-weight: 400;
  flex: 1;                 /* ambil semua sisa ruang → count terdorong ke kanan */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s, font-weight 0.12s;
}

/* ── Nama biru & bold saat selected ──────────────────────────────────────── */
.tnode-name--sel {
  color: #1d4ed8 !important;
  font-weight: 600 !important;
}

.tnode-name--match {
  color: #92400e;
  font-weight: 600;
}

.tnode-name--role-match {
  color: var(--text-primary);
  font-weight: 500;
}

.tnode-count {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  background: #f3f4f6;
  border: 1px solid var(--border-strong);
  padding: 2px 10px;
  border-radius: 10px;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
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
</style>