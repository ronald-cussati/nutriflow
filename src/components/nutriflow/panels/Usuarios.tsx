import { useEffect, useState } from 'react'
import { Pencil, Trash2, UserPlus } from 'lucide-react'
import { deleteProfile, listPatients, listProfiles } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { useAuth } from '../../../lib/authContext'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Patient, type Profile } from '../../../lib/types'
import { initials, roleBadgeClass, avatarColor, bgForRole } from '../../../lib/uiHelpers'
import { UserModal } from '../UserModal'
import { PanelSkeleton } from '../PanelSkeleton'

export function Usuarios() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Profile | null | undefined>(undefined)

  async function refresh() {
    const [pr, pt] = await Promise.all([listProfiles(), listPatients()])
    setProfiles(pr)
    setPatients(pt)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleRemove(p: Profile) {
    if (!confirm(`Remover usuário "${p.name}"?`)) return
    try {
      await deleteProfile(p.id)
      toast('ok', 'Usuário removido')
      refresh()
    } catch (e) {
      toast('er', 'Erro ao remover', (e as Error).message)
    }
  }

  if (loading) return <PanelSkeleton />

  const unlinkedPatients = patients.filter((p) => !p.user_id)

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Usuários & permissões</h2>
          <p>Gestão da equipe e dos acessos por papel</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
            <UserPlus size={15} />
            Novo usuário
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th className="th-permissions">Permissões</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span className="fb-av" style={{ width: 34, height: 34, background: bgForRole(u.role), color: avatarColor(u.role) }}>
                        {initials(u.name)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`bg ${roleBadgeClass(u.role)}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="th-permissions" style={{ maxWidth: 320, fontSize: 12 }}>{ROLE_DESCRIPTIONS[u.role]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-b btn-sm icon-btn" onClick={() => setEditing(u)} aria-label="Editar">
                        <Pencil size={14} />
                      </button>
                      {u.id !== session?.user.id ? (
                        <button className="btn btn-d btn-sm icon-btn" onClick={() => handleRemove(u)} aria-label="Remover">
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        open={editing !== undefined}
        profile={editing ?? null}
        unlinkedPatients={unlinkedPatients}
        onClose={() => setEditing(undefined)}
        onSaved={refresh}
      />
    </div>
  )
}
