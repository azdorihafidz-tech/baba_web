<template>
  <div class="page">

    <!-- ── TOP HEADER ─────────────────────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Struktur Hierarki</h1>
        <p class="page-sub">Visualisasi pohon organisasi akun</p>
      </div>
      <div class="header-right">
        <div class="total-chip">Total: {{ rawData.length }} akun</div>
        <button class="hdr-btn" @click="collapseAll">Tutup Semua</button>
        <button class="hdr-btn hdr-btn--open" @click="expandAll">Buka Semua</button>
      </div>
    </div>

    <!-- ── ROLE STAT CARDS ─────────────────────────────────────────────────── -->
    <div class="stat-row">
      <div v-for="role in ROLE_ORDER" :key="role" class="stat-card" :style="{ borderTopColor: ROLE_COLORS[role] }">
        <div class="stat-card-label" :style="{ color: ROLE_COLORS[role] }">{{ role }}</div>
        <div class="stat-card-value" :style="{ color: ROLE_COLORS[role] }">
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
          <span class="tree-topbar-title">Pohon Hierarki</span>
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
              :filtered-ids="filteredIds" :search-active="searchQuery.trim().length > 0"
              :collapse-signal="collapseSignal" :expand-signal="expandSignal" @select="onSelect" />
          </template>
          <div v-else class="center-state">
            <span style="color:#4a5568;font-size:13px">Tidak ada hasil</span>
          </div>
        </div>
      </div>

      <!-- Detail Panel -->
      <div class="detail-panel">
        <div class="detail-header-bar">Detail Akun</div>

        <template v-if="selected">
          <div class="detail-avatar-row">
            <div class="detail-avatar" :style="{ background: roleGradient(selected.jabatan) }">
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

// ─── Computed ─────────────────────────────────────────────────────────────────
const roleCounts = computed(() => {
  const counts = {};
  rawData.value.forEach(n => {
    const j = n.jabatan?.toUpperCase();
    counts[j] = (counts[j] ?? 0) + 1;
  });
  return counts;
});

const filteredRoots = computed(() => {
  if (!searchQuery.value.trim()) return treeRoots.value;
  return treeRoots.value.filter(r => hasDesc(r, filteredIds.value));
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
}

function clearSearch() {
  searchQuery.value = '';
  filteredIds.value = new Set();
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
  return `linear-gradient(135deg, ${c}cc, ${c}44)`;
}

function badgeStyle(role) {
  const c = roleColor(role);
  return { background: c + '22', color: c, border: `1px solid ${c}45` };
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
    searchActive: Boolean,
    collapseSignal: Number,
    expandSignal: Number,
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(Number(props.node?.depth ?? 0) < 2);

    // Watch for global collapse/expand signals
    let prevCollapse = props.collapseSignal;
    let prevExpand = props.expandSignal;

    function isVisible() {
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
      // React to collapse/expand signals
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
      const color = ROLE_COLORS[node.jabatan?.toUpperCase()] || '#6b7280';

      return h('div', { class: 'tnode-wrap' }, [
        h('div', {
          class: ['tnode-row', isSelected && 'tnode-row--sel', isMatch && 'tnode-row--match'],
          style: { paddingLeft: `${14 + props.depth * 24}px` },
          onClick: () => emit('select', node),
        }, [
          // Chevron
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

          // Badge
          h('span', {
            class: 'tnode-badge',
            style: { background: color + '22', color, border: `1px solid ${color}40` },
          }, node.jabatan),

          // Name
          h('span', { class: ['tnode-name', isMatch && 'tnode-name--match'] }, node.nama),

          // Count badge
          Number(node.jumlah_bawahan) > 0
            ? h('span', { class: 'tnode-count' }, node.jumlah_bawahan)
            : null,
        ]),

        // Children
        hasChildren && open.value
          ? h('div', null,
            node.children.map(child =>
              h(TreeNode, {
                key: child.id,
                node: child,
                depth: props.depth + 1,
                selectedId: props.selectedId,
                filteredIds: props.filteredIds,
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0b0d12;
  font-family: 'Outfit', sans-serif;
  color: #e2e8f0;
  overflow: hidden;
}

/* ── Page Header ─────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 12px;
  flex-shrink: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.3px;
}

.page-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-chip {
  font-size: 12px;
  color: #94a3b8;
  background: #151923;
  border: 1px solid #1e2535;
  padding: 5px 14px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
}

.hdr-btn {
  background: #151923;
  border: 1px solid #1e2535;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.15s;
}

.hdr-btn:hover {
  background: #1e2535;
  color: #e2e8f0;
}

.hdr-btn--open {
  background: #1a2540;
  border-color: #2a3a60;
  color: #60a5fa;
}

.hdr-btn--open:hover {
  background: #1e2d4d;
  color: #93c5fd;
}

/* ── Stat Row ─────────────────────────────────────────────────────────────── */
.stat-row {
  display: flex;
  gap: 12px;
  padding: 0 24px 14px;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  background: #101420;
  border: 1px solid #1e2535;
  border-top-width: 2.5px;
  border-radius: 10px;
  padding: 14px 16px;
  min-width: 0;
}

.stat-card-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
  padding: 0 24px 24px;
}

/* ── Tree Panel ───────────────────────────────────────────────────────────── */
.tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #101420;
  border: 1px solid #1e2535;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 14px;
}

.tree-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #1e2535;
  flex-shrink: 0;
}

.tree-topbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: hsl(223, 24%, 6%);
  border: 1px solid #1e2535;
  border-radius: 8px;
  padding: 6px 12px;
  width: 240px;
  transition: border-color 0.15s;
}

.search-box.focused {
  border-color: #3b82f6;
}

.search-box svg {
  color: #4a5568;
  flex-shrink: 0;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 13px;
  font-family: inherit;
  flex: 1;
  min-width: 0;
}

.search-box input::placeholder {
  color: #4a5568;
}

.search-all-btn {
  background: #1e2535;
  border: none;
  color: #94a3b8;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.search-all-btn:hover {
  background: #252d3d;
  color: #e2e8f0;
}

/* ── Tree Scroll ──────────────────────────────────────────────────────────── */
.tree-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
  scrollbar-width: thin;
  scrollbar-color: #1e2535 transparent;
}

.tree-scroll::-webkit-scrollbar {
  width: 4px;
}

.tree-scroll::-webkit-scrollbar-thumb {
  background: #1e2535;
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
  color: #64748b;
  font-size: 13px;
  padding: 48px;
}

.error-state {
  color: #f87171;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid #1e2535;
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
  background: #1e2535;
  border: 1px solid #252d3d;
  color: #94a3b8;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.15s;
}

.retry-btn:hover {
  background: #252d3d;
  color: #e2e8f0;
}

/* ── Tree Nodes ───────────────────────────────────────────────────────────── */
.tnode-wrap {
  width: 100%;
}

.tnode-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-right: 14px;
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
  min-height: 34px;
  user-select: none;
}

.tnode-row:hover {
  background: #141824;
}

.tnode-row--sel {
  background: #19223a !important;
}

.tnode-row--sel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
  border-radius: 0 2px 2px 0;
}

.tnode-row--match {
  background: #1a1d10 !important;
}

.tnode-row--match::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #f59e0b;
  border-radius: 0 2px 2px 0;
}

.tnode-toggle {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  flex-shrink: 0;
  border-radius: 4px;
  transition: background 0.12s;
}

.tnode-toggle:not(.tnode-toggle--empty):hover {
  background: #252d3d;
  color: #94a3b8;
}

.tnode-toggle--empty {
  cursor: default;
}

.tnode-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.15px;
}

.tnode-name {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 400;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tnode-name--match {
  color: #fbbf24;
  font-weight: 500;
}

.tnode-count {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #4a5568;
  background: #0b0d12;
  border: 1px solid #1e2535;
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}

/* ── Detail Panel ─────────────────────────────────────────────────────────── */
.detail-panel {
  width: 300px;
  flex-shrink: 0;
  background: #101420;
  border: 1px solid #1e2535;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #1e2535 transparent;
}

.detail-panel::-webkit-scrollbar {
  width: 4px;
}

.detail-panel::-webkit-scrollbar-thumb {
  background: #1e2535;
  border-radius: 2px;
}

.detail-header-bar {
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  border-bottom: 1px solid #1e2535;
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
  color: #fff;
  letter-spacing: 1px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

.detail-name {
  padding: 0 18px 6px;
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
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
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 10px;
}

.dot-sep {
  color: #2d3748;
}

.meta-small {
  font-size: 11px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.detail-stats {
  display: flex;
  border-top: 1px solid #1e2535;
  border-bottom: 1px solid #1e2535;
}

.stat-block {
  flex: 1;
  padding: 14px 18px;
  border-right: 1px solid #1e2535;
}

.stat-block:last-child {
  border-right: none;
}

.stat-lbl {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.stat-val {
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid #1e2535;
}

.detail-cell {
  flex: 1;
  padding: 12px 18px;
  border-right: 1px solid #1e2535;
}

.detail-cell:last-child {
  border-right: none;
}

.cell-lbl {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.cell-val {
  font-size: 12.5px;
  color: #94a3b8;
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
  font-weight: 600;
  letter-spacing: 0.7px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 9px;
}

.bawahan-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 9px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 2px;
}

.bawahan-item:hover {
  background: #0b0d12;
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
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bawahan-badge {
  font-size: 9.5px;
  font-weight: 600;
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
  color: #4a5568;
  font-size: 12px;
  text-align: center;
  padding: 24px;
}

.empty-hand {
  font-size: 36px;
  filter: grayscale(0.3);
}
</style>