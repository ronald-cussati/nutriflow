import { useEffect, useState } from 'react'
import { listPatients, listProfiles } from '../../../lib/api'
import { deleteStaffUser } from '../../../server/users'
import { toast } from '../../../lib/toast'
import { useAuth } from '../../../lib/authContext'
import { ROLE_LABELS, type Patient, type Profile } from '../../../lib/types'
import { roleBadgeClass } from '../../../lib/uiHelpers'
import { UserModal } from '../UserModal'

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
      await deleteStaffUser({ data: { id: p.id } })
      toast('ok', 'Usuário removido')
      refresh()
    } catch (e) {
      toast('er', 'Erro ao remover', (e as Error).message)
    }
  }

  if (loading) return <div className="emp">Carregando...</div>

  const unlinkedPatients = patients.filter((p) => !p.user_id)

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Usuários</h2>
          <p>Gerenciar equipe e permissões</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
            + Novo Usuário
          </button>
        </div>
      </div>
      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--t1)' }}>{u.name}</div>
                  </td>
                  <td>
                    <span className={`bg ${roleBadgeClass(u.role)}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-b btn-sm" onClick={() => setEditing(u)}>
                        ✏️ Editar
                      </button>
                      {u.id !== session?.user.id ? (
                        <button className="btn btn-d btn-sm" onClick={() => handleRemove(u)}>
                          🗑️
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
