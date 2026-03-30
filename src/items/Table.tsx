import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { UI_CONFIG } from '@constants/variable.constant';
import { Button } from './Button';

export type TableColumn<T> = {
  id: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  cell: (row: T) => ReactNode;
  /** Si défini, l’en-tête est cliquable et trie selon cette valeur (toutes les lignes avant pagination côté client ; en mode serveur, uniquement la page courante). */
  sortValue?: (row: T) => string | number | null | undefined;
};

/** Pagination pilotée par l’API (`limit` / `offset`) : `rows` = page courante uniquement. */
export type TableServerPagination = {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

type TableProps<T> = {
  rows: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  /** Taille de page initiale (mode client) ou synchronisée avec le parent (mode serveur). */
  pageSize?: number;
  minPageSize?: number;
  maxPageSize?: number;
  showPageSizeControl?: boolean;
  emptyLabel?: string;
  serverPagination?: TableServerPagination;
};

const defaultPageSize = 6;
const defaultMinPageSize = 1;
const defaultMaxPageSize = 200;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

type SortState = { columnId: string; dir: 'asc' | 'desc' };

function compareSortCells(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): number {
  const aNull = a == null || a === '';
  const bNull = b == null || b === '';
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }
  return String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
}

function sortRowsByColumn<T>(
  data: T[],
  columns: TableColumn<T>[],
  sort: SortState | null
): T[] {
  if (!sort) return data;
  const col = columns.find((c) => c.id === sort.columnId);
  if (!col?.sortValue) return data;
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...data].sort((r1, r2) => {
    const cmp = compareSortCells(col.sortValue!(r1), col.sortValue!(r2));
    return cmp * dir;
  });
}

function buildPageList(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set<number>();
  pages.add(0);
  pages.add(totalPages - 1);
  for (let d = -2; d <= 2; d++) {
    const p = currentPage + d;
    if (p >= 0 && p < totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (cur - prev > 1) result.push('ellipsis');
    }
    result.push(cur);
  }
  return result;
}

/** Tableau paginé ; mode client ou serveur ; bandes 2 lignes sur 2. */
export const Table = <T,>({
  rows,
  columns,
  getRowId,
  onRowClick,
  selectedRowId,
  pageSize: pageSizeProp = defaultPageSize,
  minPageSize = defaultMinPageSize,
  maxPageSize = defaultMaxPageSize,
  showPageSizeControl = true,
  emptyLabel = 'Aucune ligne à afficher.',
  serverPagination,
}: TableProps<T>) => {
  const server = serverPagination != null;

  const [page, setPage] = useState(0);
  const [pageSizeInner, setPageSizeInner] = useState(() =>
    clamp(pageSizeProp, minPageSize, maxPageSize)
  );
  const [pageSizeDraft, setPageSizeDraft] = useState(String(clamp(pageSizeProp, minPageSize, maxPageSize)));
  const [sort, setSort] = useState<SortState | null>(null);

  const effectivePageSize = server ? serverPagination.pageSize : pageSizeInner;
  const effectivePage = server ? serverPagination.page : page;

  useEffect(() => {
    if (server) {
      const v = clamp(serverPagination.pageSize, minPageSize, maxPageSize);
      setPageSizeDraft(String(v));
      return;
    }
    const v = clamp(pageSizeProp, minPageSize, maxPageSize);
    setPageSizeInner(v);
    setPageSizeDraft(String(v));
  }, [server, serverPagination?.pageSize, pageSizeProp, minPageSize, maxPageSize]);

  const totalRowCount = server ? serverPagination.total : rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRowCount / effectivePageSize) || 1);

  useEffect(() => {
    if (server) return;
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [rows.length, totalPages, server]);

  const sortedRows = useMemo(
    () => sortRowsByColumn(rows, columns, sort),
    [rows, columns, sort]
  );

  const pageRows = useMemo(() => {
    if (server) return sortedRows;
    return sortedRows.slice(page * pageSizeInner, page * pageSizeInner + pageSizeInner);
  }, [sortedRows, page, pageSizeInner, server]);

  const onHeaderSortClick = (col: TableColumn<T>) => {
    if (!col.sortValue) return;
    setSort((prev) => {
      if (prev?.columnId === col.id) {
        return { columnId: col.id, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { columnId: col.id, dir: 'asc' };
    });
    if (!server) setPage(0);
  };

  const canPrev = effectivePage > 0;
  const canNext = effectivePage < totalPages - 1;
  const pageList = useMemo(() => buildPageList(effectivePage, totalPages), [effectivePage, totalPages]);

  const goToPage = (p: number) => {
    if (server) {
      serverPagination.onPageChange(p);
    } else {
      setPage(p);
    }
  };

  const applyPageSizeFromInput = () => {
    const parsed = Number.parseInt(pageSizeDraft.replace(/\s/g, ''), 10);
    const next = Number.isFinite(parsed) ? clamp(parsed, minPageSize, maxPageSize) : effectivePageSize;
    if (server) {
      serverPagination.onPageSizeChange(next);
    } else {
      setPageSizeInner(next);
      setPage(0);
    }
    setPageSizeDraft(String(next));
  };

  const numberInputStyle = {
    width: 56,
    padding: '0.35rem 0.45rem',
    borderRadius: UI_CONFIG.radii.sm,
    border: `1px solid ${UI_CONFIG.colors.black}33`,
    fontSize: '0.85rem',
    font: 'inherit',
    boxSizing: 'border-box' as const,
  };

  const isEmpty = server ? serverPagination.total === 0 : rows.length === 0;

  if (isEmpty) {
    return (
      <p style={{ color: `${UI_CONFIG.colors.black}99`, margin: '0.75rem 0' }}>{emptyLabel}</p>
    );
  }

  const pageSizeToolbar =
    showPageSizeControl ? (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.85rem',
          color: `${UI_CONFIG.colors.black}cc`,
          marginLeft: 'auto',
        }}
      >
        <span>Lignes par page</span>
        <input
          type="number"
          min={minPageSize}
          max={maxPageSize}
          value={pageSizeDraft}
          onChange={(e) => setPageSizeDraft(e.target.value)}
          onBlur={() => applyPageSizeFromInput()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyPageSizeFromInput();
            }
          }}
          aria-label={`Nombre de lignes par page, entre ${minPageSize} et ${maxPageSize}`}
          style={numberInputStyle}
        />
        <span style={{ fontSize: '0.78rem', color: `${UI_CONFIG.colors.black}88` }}>(max. {maxPageSize})</span>
      </label>
    ) : null;

  return (
    <div>
      {showPageSizeControl ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '0.5rem',
            minHeight: showPageSizeControl ? undefined : 0,
          }}
        >
          {pageSizeToolbar}
        </div>
      ) : null}

      <div
        style={{
          overflowX: 'auto',
          border: `1px solid ${UI_CONFIG.colors.black}18`,
          borderRadius: UI_CONFIG.radii.md,
          background: UI_CONFIG.colors.white,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
            background: UI_CONFIG.colors.white,
          }}
        >
          <thead>
            <tr
              style={{
                background: UI_CONFIG.colors.primary,
                color: UI_CONFIG.colors.white,
                textAlign: 'left',
                borderBottom: `2px solid ${UI_CONFIG.colors.primaryLight}99`,
              }}
            >
              {columns.map((col) => {
                const sortable = Boolean(col.sortValue);
                const active = sort?.columnId === col.id;
                const ariaSort = !sortable
                  ? undefined
                  : active
                    ? sort!.dir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none';
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    onClick={sortable ? () => onHeaderSortClick(col) : undefined}
                    onKeyDown={
                      sortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onHeaderSortClick(col);
                            }
                          }
                        : undefined
                    }
                    tabIndex={sortable ? 0 : undefined}
                    style={{
                      padding: '0.55rem 0.65rem',
                      fontWeight: 700,
                      width: col.width,
                      textAlign: col.align ?? 'left',
                      cursor: sortable ? 'pointer' : undefined,
                      userSelect: sortable ? 'none' : undefined,
                      outlineOffset: 2,
                    }}
                    title={sortable ? 'Cliquer pour trier' : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {col.header}
                      {sortable ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            opacity: active ? 1 : 0.55,
                            fontWeight: 800,
                          }}
                          aria-hidden
                        >
                          {active ? (sort!.dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIdx) => {
              const id = getRowId(row);
              const selected = selectedRowId != null && id === selectedRowId;
              const interactive = Boolean(onRowClick);
              const pairStripe = Math.floor(rowIdx / 2) % 2 === 1;
              const stripeBg = pairStripe ? UI_CONFIG.colors.gray : UI_CONFIG.colors.white;
              return (
                <tr
                  key={id}
                  onClick={interactive ? () => onRowClick?.(row) : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick?.(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={interactive ? 0 : undefined}
                  role={interactive ? 'button' : undefined}
                  aria-label={interactive ? 'Sélectionner cette ligne' : undefined}
                  style={{
                    borderBottom: `1px solid ${UI_CONFIG.colors.black}12`,
                    background: selected ? `${UI_CONFIG.colors.primary}18` : stripeBg,
                    cursor: interactive ? 'pointer' : undefined,
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      style={{
                        padding: '0.55rem 0.65rem',
                        verticalAlign: 'top',
                        textAlign: col.align ?? 'left',
                      }}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginTop: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canPrev}
            onClick={() => goToPage(effectivePage - 1)}
            style={{ borderRadius: UI_CONFIG.radii.sm }}
          >
            Précédent
          </Button>
          {pageList.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`e-${idx}`}
                style={{
                  padding: '0 4px',
                  fontSize: '0.85rem',
                  color: `${UI_CONFIG.colors.black}88`,
                  userSelect: 'none',
                }}
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === effectivePage ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => goToPage(item)}
                aria-label={`Page ${item + 1}`}
                aria-current={item === effectivePage ? 'page' : undefined}
                style={{
                  borderRadius: UI_CONFIG.radii.sm,
                  minWidth: 36,
                  padding: '0.35rem 0.5rem',
                }}
              >
                {item + 1}
              </Button>
            )
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canNext}
            onClick={() => goToPage(effectivePage + 1)}
            style={{ borderRadius: UI_CONFIG.radii.sm }}
          >
            Suivant
          </Button>
        </div>
        <span style={{ fontSize: '0.85rem', color: `${UI_CONFIG.colors.black}aa`, marginLeft: 'auto' }}>
          {totalRowCount} résultat{totalRowCount > 1 ? 's' : ''} · page {effectivePage + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
};
