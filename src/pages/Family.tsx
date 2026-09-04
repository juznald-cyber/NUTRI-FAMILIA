import React, { useState, useEffect } from 'react';
import { UserPlus, Edit3, Trash2, Save, X, Users, LogOut, ShieldCheck, Calculator, Sparkles, Flame } from 'lucide-react';
import { useFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../hooks/useDatabase';
import { useAuth } from '../context/AuthContext';
import type { FamilyMember } from '../db';
import { 
  calculateAge, 
  calculateEstimatedCalories, 
  ACTIVITY_MULTIPLIERS, 
  type ActivityLevel 
} from '../utils/nutritionCalculator';

const EMOJI_OPTIONS = ['👨', '👩', '👦', '👧', '👶', '🧓', '👴', '👵', '🐕', '🐱'];

const RESTRICTION_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa',
  'Sin mariscos', 'Sin frutos secos', 'Bajo en sodio',
  'Diabético', 'Hipertensión', 'Embarazo',
];

const Family: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const members = useFamilyMembers();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    emoji: '👨',
    birthDate: '',
    age: 30,
    gender: 'male' as 'male' | 'female',
    weightKg: '' as number | '',
    heightCm: '' as number | '',
    activityLevel: 'moderate' as ActivityLevel,
    calorieGoal: 2000,
    restrictions: [] as string[],
  });

  const resetForm = () => {
    setForm({
      name: '',
      emoji: '👨',
      birthDate: '',
      age: 30,
      gender: 'male',
      weightKg: '',
      heightCm: '',
      activityLevel: 'moderate',
      calorieGoal: 2000,
      restrictions: [],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  // Automatically recalculate calories whenever relevant demographic inputs change
  const handleRecalculate = (
    updatedFields: Partial<typeof form>
  ) => {
    const updated = { ...form, ...updatedFields };

    let computedAge = updated.age;
    if (updatedFields.birthDate !== undefined) {
      if (updatedFields.birthDate) {
        computedAge = calculateAge(updatedFields.birthDate);
        updated.age = computedAge;
      }
    }

    const estimatedCalories = calculateEstimatedCalories({
      age: computedAge,
      gender: updated.gender,
      weightKg: typeof updated.weightKg === 'number' && updated.weightKg > 0 ? updated.weightKg : undefined,
      heightCm: typeof updated.heightCm === 'number' && updated.heightCm > 0 ? updated.heightCm : undefined,
      activityLevel: updated.activityLevel,
    });

    updated.calorieGoal = estimatedCalories;
    setForm(updated);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const memberData: Omit<FamilyMember, 'id'> = {
      name: form.name.trim(),
      emoji: form.emoji,
      birthDate: form.birthDate || undefined,
      age: form.age,
      gender: form.gender,
      weightKg: typeof form.weightKg === 'number' && form.weightKg > 0 ? form.weightKg : undefined,
      heightCm: typeof form.heightCm === 'number' && form.heightCm > 0 ? form.heightCm : undefined,
      activityLevel: form.activityLevel,
      calorieGoal: form.calorieGoal,
      restrictions: form.restrictions,
    };

    if (editingId) {
      await updateFamilyMember(editingId, memberData);
    } else {
      await addFamilyMember(memberData);
    }
    resetForm();
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingId(member.id!);
    setForm({
      name: member.name,
      emoji: member.emoji,
      birthDate: member.birthDate || '',
      age: member.age,
      gender: member.gender || (['👩', '👧', '👵'].includes(member.emoji) ? 'female' : 'male'),
      weightKg: member.weightKg || '',
      heightCm: member.heightCm || '',
      activityLevel: member.activityLevel || 'moderate',
      calorieGoal: member.calorieGoal,
      restrictions: member.restrictions,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    await deleteFamilyMember(id);
  };

  const toggleRestriction = (restriction: string) => {
    setForm(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction],
    }));
  };

  const totalCalories = members?.reduce((sum, m) => sum + m.calorieGoal, 0) || 0;

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="apple-large-title">Mi Familia</h1>
          <p className="text-sm text-apple-gray-1 dark:text-gray-400 mt-0.5">
            {members?.length || 0} miembros
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center shadow-apple active:scale-95 transition-transform"
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Summary Card */}
      {members && members.length > 0 && (
        <div className="apple-glass rounded-apple-lg p-5 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-apple-blue" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Resumen Familiar</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">Miembros</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCalories.toLocaleString()}</p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">kcal/día total</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="apple-card p-5 mb-5 animate-scale-in border border-apple-blue/20 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-apple-blue" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Editar Integrante' : 'Nuevo Integrante'}
              </h3>
            </div>
            <button onClick={resetForm} className="text-apple-gray-2 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Emoji Selector */}
          <div className="mb-4">
            <label className="apple-section-title">Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    const newGender = ['👩', '👧', '👵'].includes(emoji) ? 'female' : 'male';
                    handleRecalculate({ emoji, gender: newGender });
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    form.emoji === emoji
                      ? 'bg-apple-blue/15 dark:bg-apple-blue/30 ring-2 ring-apple-blue scale-110'
                      : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="sm:col-span-2">
              <label className="apple-section-title">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del integrante"
                className="apple-input"
              />
            </div>
            <div>
              <label className="apple-section-title">Género / Sexo</label>
              <select
                value={form.gender}
                onChange={e => handleRecalculate({ gender: e.target.value as 'male' | 'female' })}
                className="apple-input"
              >
                <option value="male">Masculino 👨</option>
                <option value="female">Femenino 👩</option>
              </select>
            </div>
          </div>

          {/* Birth Date & Calculated Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-apple-sm border border-gray-100 dark:border-white/5">
            <div>
              <label className="apple-section-title flex items-center gap-1.5">
                <span>Fecha de Nacimiento</span>
                <span className="text-[10px] text-apple-blue font-bold">Auto-edad</span>
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => handleRecalculate({ birthDate: e.target.value })}
                className="apple-input"
              />
            </div>

            <div>
              <label className="apple-section-title">Edad Calculada</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.age}
                  onChange={e => handleRecalculate({ age: parseInt(e.target.value) || 0 })}
                  className="apple-input"
                  min={0}
                  max={120}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-apple-gray-1 dark:text-gray-400">
                  años
                </span>
              </div>
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="apple-section-title">Peso (kg)</label>
              <input
                type="number"
                value={form.weightKg}
                onChange={e => handleRecalculate({ weightKg: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                placeholder="Ej. 70"
                step="0.5"
                min="1"
                max="300"
                className="apple-input"
              />
            </div>
            <div>
              <label className="apple-section-title">Estatura (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                onChange={e => handleRecalculate({ heightCm: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                placeholder="Ej. 175"
                min="30"
                max="250"
                className="apple-input"
              />
            </div>
          </div>

          {/* Physical Activity Level */}
          <div className="mb-4">
            <label className="apple-section-title">Nivel de Actividad Física</label>
            <select
              value={form.activityLevel}
              onChange={e => handleRecalculate({ activityLevel: e.target.value as ActivityLevel })}
              className="apple-input"
            >
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} ({config.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Calorie Goal Highlight */}
          <div className="mb-5 p-4 rounded-apple-sm bg-gradient-to-r from-apple-orange/10 to-apple-pink/10 dark:from-apple-orange/20 dark:to-apple-pink/20 border border-apple-orange/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-apple-orange" />
                <label className="text-xs font-bold uppercase tracking-wider text-apple-orange">
                  Meta Calórica Diaria Recomendada
                </label>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-apple-orange/15 text-apple-orange flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-calculada
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.calorieGoal}
                onChange={e => setForm(prev => ({ ...prev, calorieGoal: parseInt(e.target.value) || 0 }))}
                className="apple-input font-bold text-lg text-apple-orange bg-white dark:bg-[#1C1C1E] border border-apple-orange/30 focus:border-apple-orange"
                min={500}
                max={6000}
                step={50}
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">kcal/día</span>
            </div>
            <p className="text-[11px] text-apple-gray-1 dark:text-gray-400 mt-2">
              Calculada mediante la fórmula nutricional Mifflin-St Jeor según edad ({form.age} años), género ({form.gender === 'male' ? 'Hombre' : 'Mujer'}), peso ({form.weightKg || 'estimado'} kg), estatura ({form.heightCm || 'estimada'} cm) y actividad ({ACTIVITY_MULTIPLIERS[form.activityLevel]?.label}).
            </p>
          </div>

          {/* Restrictions */}
          <div className="mb-5">
            <label className="apple-section-title">Restricciones Alimenticias</label>
            <div className="flex flex-wrap gap-2">
              {RESTRICTION_OPTIONS.map(restriction => (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => toggleRestriction(restriction)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.restrictions.includes(restriction)
                      ? 'bg-apple-red/10 dark:bg-apple-red/20 text-apple-red ring-1 ring-apple-red/30'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} className="apple-btn-primary w-full shadow-apple">
            <Save className="w-4 h-4 mr-2" />
            {editingId ? 'Guardar Cambios' : 'Agregar Miembro'}
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members && members.length > 0 ? (
          members.map(member => (
            <div key={member.id} className="apple-card p-4 flex items-center gap-4">
              <span className="text-3xl">{member.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-apple-gray-1 dark:text-gray-400">
                    {member.age} años {member.birthDate ? `(Nac: ${member.birthDate})` : ''}
                  </span>
                  {(member.weightKg || member.heightCm) && (
                    <span className="text-xs text-apple-gray-1 dark:text-gray-400">
                      {member.weightKg ? `${member.weightKg} kg` : ''} {member.heightCm ? `· ${member.heightCm} cm` : ''}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-apple-orange">
                    🔥 {member.calorieGoal} kcal/día
                  </span>
                </div>
                {member.restrictions && member.restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.restrictions.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-apple-red/10 dark:bg-apple-red/20 text-apple-red text-[10px] font-medium rounded-full">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(member)}
                  className="w-8 h-8 flex items-center justify-center text-apple-gray-2 dark:text-gray-400 hover:text-apple-blue dark:hover:text-apple-blue transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                  title="Editar integrante"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => member.id && handleDelete(member.id)}
                  className="w-8 h-8 flex items-center justify-center text-apple-gray-2 dark:text-gray-400 hover:text-apple-red dark:hover:text-apple-red transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                  title="Eliminar integrante"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          !isAdding && (
            <div className="empty-state">
              <span className="text-5xl mb-4">👨‍👩‍👧‍👦</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sin miembros</h3>
              <p className="text-sm text-apple-gray-1 dark:text-gray-400 mb-4">
                Agrega a los miembros de tu familia para calcular sus calorías y personalizar la planificación
              </p>
              <button onClick={() => setIsAdding(true)} className="apple-btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Primer Miembro
              </button>
            </div>
          )
        )}
      </div>

      {/* Install App Section */}
      <div className="mt-8 apple-card p-5 bg-gradient-to-r from-apple-green/10 to-apple-teal/10 dark:from-apple-green/20 dark:to-apple-teal/20 border border-apple-green/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="favicon.svg" alt="App Logo" className="w-11 h-11 rounded-apple shadow-apple" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                Instalar NutriFamilia
              </p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-300 mt-0.5">
                Acceso directo desde tu pantalla de inicio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const evt = new CustomEvent('open-install-pwa');
              window.dispatchEvent(evt);
            }}
            className="px-3.5 py-2 bg-apple-green text-white text-xs font-bold rounded-full shadow-apple active:scale-95 transition-all"
          >
            Instalar
          </button>
        </div>
      </div>

      {/* Gemini AI Configuration Card */}
      <div className="mt-4 apple-card p-5 bg-gradient-to-r from-apple-blue/10 via-purple-500/10 to-apple-pink/10 dark:from-apple-blue/20 dark:via-purple-500/20 dark:to-apple-pink/20 border border-apple-blue/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-apple bg-gradient-to-tr from-apple-blue to-purple-600 text-white flex items-center justify-center shadow-apple">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                Google Gemini AI
              </p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-300 mt-0.5">
                Genera menús, tips y rutinas inteligentes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const evt = new CustomEvent('open-gemini-config');
              window.dispatchEvent(evt);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-apple-blue to-purple-600 text-white text-xs font-bold rounded-full shadow-apple active:scale-95 transition-all"
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="mt-4 apple-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center font-bold text-sm">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '👤')}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {user?.displayName || (isGuest ? 'Modo Invitado' : 'Usuario')}
              </p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                {user?.email || (isGuest ? 'Sesión local sin cuenta' : '')}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-apple-red text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 text-[11px] text-apple-gray-2 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-apple-green" />
          <span>Datos cifrados y sincronizados con tu cuenta privada.</span>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-apple-gray-2 dark:text-gray-500">NutriFamilia v1.3 · Progressive Web App (PWA)</p>
      </div>
    </div>
  );
};

export default Family;
