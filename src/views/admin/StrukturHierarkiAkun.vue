<template>
  <div class="app-layout">
    <!-- LEFT: Tree Panel -->
    <div class="tree-panel">
      <!-- Top bar -->
      <div class="topbar">
        <span class="topbar-title">Pohon Hierarki</span>
        <div class="search-box">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Cari nama atau ID..." @input="onSearch" />
          <button class="search-all" @click="clearSearch">Semua</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="center-state">
        <div class="spinner"></div>
        <span>Memuat data...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="center-state error-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
            :filtered-ids="filteredIds" :search-active="searchQuery.trim().length > 0" @select="onSelect" />
        </template>
        <div v-else class="center-state">
          <span style="color:#4a5568;font-size:13px">Tidak ada hasil ditemukan</span>
        </div>
      </div>
    </div>

    <!-- RIGHT: Detail Panel -->
    <div class="detail-panel">
      <div class="detail-header">Detail Akun</div>

      <template v-if="selected">
        <div class="detail-avatar-row">
          <div class="detail-avatar" :style="{ background: roleGradient(selected.jabatan) }">
            {{ initials(selected.nama) }}
          </div>
        </div>

        <div class="detail-name">{{ selected.nama }}</div>
        <div class="detail-meta">
          <span class="badge-role" :style="badgeStyle(selected.jabatan)">{{ selected.jabatan }}</span>
          <span class="dot-sep">·</span>
          <span class="detail-id">ID: {{ selected.no_id }}</span>
          <span class="dot-sep">·</span>
          <span class="detail-date">{{ formatDate(selected.tanggal_bergabung) }}</span>
        </div>

        <div class="detail-stats">
          <div class="stat-block">
            <div class="stat-label">BAWAHAN LANGSUNG</div>
            <div class="stat-value">{{ selected.children?.length ?? 0 }}</div>
          </div>
          <div class="stat-block">
            <div class="stat-label">TOTAL JARINGAN</div>
            <div class="stat-value">{{ selected.jumlah_bawahan }}</div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-row-item">
            <div class="dri-label">ATASAN</div>
            <div class="dri-value">{{ getParentName(selected) }}</div>
          </div>
          <div class="detail-row-item">
            <div class="dri-label">LEVEL</div>
            <div class="dri-value highlight" :style="{ color: roleColor(selected.jabatan) }">
              {{ selected.jabatan_level }}
            </div>
          </div>
        </div>

        <div class="detail-row" style="border-bottom:none">
          <div class="detail-row-item">
            <div class="dri-label">DEPTH</div>
            <div class="dri-value">Kedalaman {{ selected.depth }}</div>
          </div>
          <div class="detail-row-item" style="border-right:none">
            <div class="dri-label">BERGABUNG</div>
            <div class="dri-value">{{ formatDate(selected.tanggal_bergabung) }}</div>
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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          opacity="0.3">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <p>Pilih akun untuk melihat detail</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  'MVO': '#ef4444',
  'REGIONAL': '#a855f7',
  'FOUNDER': '#3b82f6',
  'GENERAL MANAGER': '#22d3ee',
  'SUPPLIER': '#f97316',
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
const filteredIds = ref(new Set());

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
      ? 'Endpoint tidak ditemukan. Hubungi developer.'
      : 'Gagal memuat data. Periksa koneksi Anda.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// ─── Build Tree from flat array ───────────────────────────────────────────────
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

function hasMatchDescendant(node, ids) {
  if (ids.has(node.id)) return true;
  return node.children?.some(c => hasMatchDescendant(c, ids)) ?? false;
}

const filteredRoots = computed(() => {
  if (!searchQuery.value.trim()) return treeRoots.value;
  return treeRoots.value.filter(r => hasMatchDescendant(r, filteredIds.value));
});

function onSearch() {
  const q = searchQuery.value.trim();
  filteredIds.value = q ? collectMatchIds(treeRoots.value, q) : new Set();
}

function clearSearch() {
  searchQuery.value = '';
  filteredIds.value = new Set();
}

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
  return { background: c + '25', color: c, border: `1px solid ${c}50` };
}

function formatDate(dt) {
  if (!dt) return '—';
  return dt.split(' ')[0];
}

// ─── Recursive TreeNode Component ─────────────────────────────────────────────
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    depth: Number,
    selectedId: [String, Number],
    filteredIds: Object,
    searchActive: Boolean,
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(Number(props.node?.depth ?? 0) < 2);

    function isVisible() {
      if (!props.searchActive) return true;
      return hasDesc(props.node, props.filteredIds);
    }

    function hasDesc(node, ids) {
      if (ids.has(node.id)) return true;
      return node.children?.some(c => hasDesc(c, ids)) ?? false;
    }

    function toggle(e) {
      e.stopPropagation();
      open.value = !open.value;
    }

    return () => {
      if (!isVisible()) return null;

      const node = props.node;
      const hasChildren = node.children?.length > 0;
      const isSelected = String(props.selectedId) === String(node.id);
      const isMatch = props.searchActive && props.filteredIds.has(node.id);
      const color = ROLE_COLORS[node.jabatan?.toUpperCase()] || '#6b7280';

      return h('div', { class: 'tree-node-wrap' }, [
        h('div', {
          class: [
            'tree-row',
            isSelected && 'tree-row--selected',
            isMatch && 'tree-row--match',
          ],
          style: { paddingLeft: `${16 + props.depth * 26}px` },
          onClick: () => emit('select', node),
        }, [
          // Chevron
          h('div', {
            class: ['tree-toggle', !hasChildren && 'tree-toggle--empty'],
            onClick: hasChildren ? toggle : undefined,
          }, hasChildren
            ? h('svg', {
              width: 9, height: 9, viewBox: '0 0 24 24',
              fill: 'none', stroke: 'currentColor', 'stroke-width': 3,
              style: { transform: open.value ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' },
            }, [h('path', { d: 'M9 18l6-6-6-6' })])
            : null
          ),

          // Badge jabatan
          h('span', {
            class: 'tree-badge',
            style: { background: color + '22', color, border: `1px solid ${color}45` },
          }, node.jabatan),

          // Nama
          h('span', { class: ['tree-name', isMatch && 'tree-name--match'] }, node.nama),

          // Jumlah bawahan
          Number(node.jumlah_bawahan) > 0
            ? h('span', { class: 'tree-count' }, node.jumlah_bawahan)
            : null,
        ]),

        // Children
        hasChildren && open.value
          ? h('div', { class: 'tree-children' },
            node.children.map(child =>
              h(TreeNode, {
                key: child.id,
                node: child,
                depth: props.depth + 1,
                selectedId: props.selectedId,
                filteredIds: props.filteredIds,
                searchActive: props.searchActive,
                onSelect: (n) => emit('select', n),
              })
            )
          )
          : null,
      ]);
    };
  },
});

// ─── Init ─────────────────────────────────────────────────────────────────────
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

.app-layout {
  display: flex;
  height: 100vh;
  background: #0d0f14;
  font-family: 'Outfit', sans-serif;
  color: #e2e8f0;
  overflow: hidden;
}

/* ── Tree Panel ─────────────────────────────────────────────────────────────── */
.tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e2535;
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #1e2535;
  background: #0d0f14;
  flex-shrink: 0;
}

.topbar-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: 0.3px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #151923;
  border: 1px solid #252d3d;
  border-radius: 8px;
  padding: 6px 12px;
  width: 260px;
  transition: border-color 0.15s;
}

.search-box:focus-within {
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

.search-all {
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

.search-all:hover {
  background: #252d3d;
  color: #e2e8f0;
}

/* ── States ─────────────────────────────────────────────────────────────────── */
.center-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
}

.error-state {
  color: #f87171;
}

.spinner {
  width: 28px;
  height: 28px;
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

/* ── Tree Scroll ─────────────────────────────────────────────────────────────── */
.tree-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: #1e2535 transparent;
}

.tree-scroll::-webkit-scrollbar {
  width: 4px;
}

.tree-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.tree-scroll::-webkit-scrollbar-thumb {
  background: #1e2535;
  border-radius: 2px;
}

/* ── Tree Nodes ──────────────────────────────────────────────────────────────── */
.tree-node-wrap {
  width: 100%;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 7px;
  padding-bottom: 7px;
  padding-right: 16px;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
  min-height: 36px;
  user-select: none;
}

.tree-row:hover {
  background: #151923;
}

.tree-row--selected {
  background: #1a2035 !important;
}

.tree-row--selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
  border-radius: 0 2px 2px 0;
}

.tree-row--match {
  background: #1a1f12 !important;
}

.tree-row--match::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #f59e0b;
  border-radius: 0 2px 2px 0;
}

.tree-toggle {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  flex-shrink: 0;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}

.tree-toggle:not(.tree-toggle--empty):hover {
  background: #252d3d;
  color: #94a3b8;
}

.tree-toggle--empty {
  cursor: default;
}

.tree-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}

.tree-name {
  font-size: 13.5px;
  color: #cbd5e1;
  font-weight: 400;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-name--match {
  color: #fbbf24;
  font-weight: 500;
}

.tree-count {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #4a5568;
  background: #151923;
  border: 1px solid #1e2535;
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}

.tree-children {
  width: 100%;
}

/* ── Detail Panel ────────────────────────────────────────────────────────────── */
.detail-panel {
  width: 320px;
  flex-shrink: 0;
  background: #0d0f14;
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

.detail-header {
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-bottom: 1px solid #1e2535;
  flex-shrink: 0;
}

.detail-avatar-row {
  display: flex;
  justify-content: flex-start;
  padding: 24px 20px 12px;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.detail-name {
  padding: 0 20px 8px;
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
}

.detail-meta {
  padding: 0 20px 20px;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.badge-role {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  letter-spacing: 0.2px;
}

.dot-sep {
  color: #2d3748;
  font-size: 14px;
}

.detail-id,
.detail-date {
  font-size: 11.5px;
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
  padding: 16px 20px;
  border-right: 1px solid #1e2535;
}

.stat-block:last-child {
  border-right: none;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid #1e2535;
}

.detail-row-item {
  flex: 1;
  padding: 14px 20px;
  border-right: 1px solid #1e2535;
}

.detail-row-item:last-child {
  border-right: none;
}

.dri-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.dri-value {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  word-break: break-word;
}

.dri-value.highlight {
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.bawahan-section {
  padding: 16px 20px;
}

.bawahan-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: #4a5568;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.bawahan-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 3px;
}

.bawahan-item:hover {
  background: #151923;
}

.bawahan-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bawahan-name {
  flex: 1;
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bawahan-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #4a5568;
  font-size: 13px;
}
</style>