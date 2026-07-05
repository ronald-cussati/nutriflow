import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { createProfile, updateProfile } from '../../lib/api'
import { toast } from '../../lib/toast'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Patient, type Profile, type Role } from '../../lib/types'

const ROLES: Role[] = ['medico', 'nutricionista', 'enfermeiro', 'cozinheiro', 'admin', 'paciente']

export function UserModal({
  open,
  profile,
  unlinkedPatients,
  onClose,
  onSaved,
}: {
  open: boolean
  profile: Profile | null
  unlinkedPatients: Patient[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('enfermeiro')
  const [patientId, setPatientId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(profile?.name ?? '')
    setEmail(profile?.email ?? '')
    setRole(profile?.role ?? 'enfermeiro')
    setPatientId(unlinkedPatients[0]?.id ?? '')
  }, [open, profile, unlinkedPatients])

  async function handleSave() {
    if (!name.trim() || (!profile && !email.trim())) {
      toast('er', 'Campos obrigatórios', 'Preencha nome e e-mail')
      return
    }
    setSaving(true)
    try {
      if (profile) {
        await updateProfile(profile.id, { name: name.trim(), role })
        toast('ok', 'Usuário atualizado')
      } else {
        await createProfile({
          name: name.trim(),
          email: email.trim(),
          role,
          patientId: role === 'paciente' ? patientId : undefined,
        })
        toast('ok', 'Usuário criado')
      }
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={profile ? 'Editar usuário' : 'Novo usuário'}>
      <div className="fr">
        <div className="fg">
          <label>Nome *</label>
          <input className="fc" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="fg">
          <label>E-mail {profile ? '' : '*'}</label>
          <input
            className="fc"
            type="email"
            value={email}
            disabled={!!profile}
            placeholder={profile ? '(não editável)' : 'usuario@nutriflow.app'}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="fg">
        <label>Perfil *</label>
        <select className="fc" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <div className="field-hint">{ROLE_DESCRIPTIONS[role]}</div>
      </div>
      {role === 'paciente' && !profile ? (
        <div className="fg">
          <label>Vincular a qual paciente?</label>
          <select className="fc" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {unlinkedPatients.length === 0 ? <option value="">Nenhum paciente sem login disponível</option> : null}
            {unlinkedPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Quarto {p.room}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-s" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          Salvar
        </button>
      </div>
    </Modal>
  )
}
