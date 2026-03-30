# `src/items` — composants UI réutilisables

Conformément à **`.cursorrules`** à la racine du dépôt :

- Tous les blocs d’interface réutilisables (champs, tableaux, modales, alertes, etc.) vivent ici.
- **Un fichier = un type** (`Table.tsx`, `Input.tsx`, `Modal.tsx`, …). Pas de doublons (`Input2`, `CustomTable`, …).
- **Exports nommés** : `export const Table`, `export const Input`, etc.
- Pour une variante, **étendre le fichier existant** avec des props optionnelles, en restant rétrocompatible.

## Fichiers

| Fichier               | Export              | Usage principal                          |
| --------------------- | ------------------- | ---------------------------------------- |
| `Table.tsx`           | `Table`, `TableColumn` | Tableaux paginés, sélection ligne optionnelle |
| `Input.tsx`           | `Input`             | Champ avec label + animation focus       |
| `Modal.tsx`           | `Modal`             | Overlay + panneau (dialog)               |
| `Alert.tsx`           | `Alert`             | Message animé success / error / info     |
| `Typewriter.tsx`      | `Typewriter`        | Texte affiché caractère par caractère    |
| `CenteredPage.tsx`    | `CenteredPage`      | Contenu centré, largeur max               |
| `FormPageShell.tsx`   | `FormPageShell`     | Carte formulaire (connexion / inscription), même entrée que `Panel` |
| `Panel.tsx`           | `Panel`             | Cadre carte + entrée fondu depuis le bas   |
| `BlurredBackground.tsx` | `BlurredBackground` | Fond global flou                         |
| `Button.tsx`            | `Button`            | Boutons (variantes `primary`, `secondary`, `outline`, …) |

## Exemple `Button`

```tsx
import { Button } from '@/items/Button';

<Button type="submit" variant="primary" size="lg" fullWidth>
  Valider
</Button>
<Button variant="outlineMuted" type="button" onClick={onClose}>
  Fermer
</Button>
<Button variant="segment" active={tab === 'a'} type="button" onClick={() => setTab('a')}>
  Onglet A
</Button>
```

## Exemple `Panel`

```tsx
import { Panel } from '@/items/Panel';

<Panel>
  <h2>Titre de section</h2>
  <p>Contenu dans un cadre cohérent avec le design system.</p>
</Panel>

<Panel flat style={{ padding: '1rem' }}>
  Variante sans ombre.
</Panel>
```

## Exemple `Table`

```tsx
import { Table, type TableColumn } from '@/items/Table';

const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Nom', cell: (r) => r.name },
];

<Table
  rows={data}
  columns={columns}
  getRowId={(r) => r.id}
  onRowClick={(r) => setSelected(r.id)}
  selectedRowId={selectedId}
  pageSize={8}
/>;
```

Ne pas recréer de `<table>` ad hoc dans les pages : réutiliser `Table` ou proposer une évolution via props.
