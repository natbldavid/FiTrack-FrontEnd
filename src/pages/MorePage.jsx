import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePasscode } from '../api/authApi'
import { getUserProfile, updateUserProfile, createUserGoalsHistory } from '../api/userApi'
import { ROUTES } from '../routes/routePaths'

function ChevronIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${
        isOpen ? 'rotate-180' : 'rotate-0'
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function WeightGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-rose-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4a8 8 0 1 0 8 8" />
      <path d="M12 12l3-3" />
    </svg>
  )
}

function ExerciseGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-emerald-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10v4" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
      <path d="M21 10v4" />
      <path d="M6 12h12" />
    </svg>
  )
}

function GymGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-violet-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16" />
      <path d="M6 9v6" />
      <path d="M18 9v6" />
      <path d="M9 10v4" />
      <path d="M15 10v4" />
    </svg>
  )
}

function CalorieGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-orange-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c2 3 5 5.5 5 9a5 5 0 1 1-10 0c0-3.5 3-6 5-9Z" />
    </svg>
  )
}

function ProteinGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-sky-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="12" rx="7" ry="9" />
    </svg>
  )
}

function CarbGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-amber-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 6c0-1.7 1.8-3 4-3s4 1.3 4 3-1.8 3-4 3-4-1.3-4-3Z" />
      <path d="M8 6v6c0 1.7 1.8 3 4 3s4-1.3 4-3V6" />
      <path d="M8 12v6c0 1.7 1.8 3 4 3s4-1.3 4-3v-6" />
    </svg>
  )
}

function FatGoalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-pink-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4c3 4 5 6.5 5 10a5 5 0 1 1-10 0c0-3.5 2-6 5-10Z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

function GoalRow({
  label,
  value,
  icon,
  isEditing,
  inputName,
  onChange,
  suffix = '',
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="shrink-0">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        {isEditing ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              name={inputName}
              type="number"
              min="0"
              value={value}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            {suffix ? (
              <span className="text-sm font-medium text-slate-500">{suffix}</span>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {value}
            {suffix ? ` ${suffix}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function MorePage() {
  const navigate = useNavigate()

  const [isPersonalOpen, setIsPersonalOpen] = useState(false)
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false)

  const [profileData, setProfileData] = useState(null)
  const [profileForm, setProfileForm] = useState({
    currentWeight: '',
    dailyCalorieGoal: '',
    dailyProteinGoal: '',
    dailyCarbGoal: '',
    dailyFatGoal: '',
    weightGoal: '',
    weeklyExerciseGoal: '',
    weeklyGymGoal: '',
  })

  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [passcodeForm, setPasscodeForm] = useState({
    currentPasscode: '',
    newPasscode: '',
    confirmNewPasscode: '',
  })
  const [passcodeError, setPasscodeError] = useState('')
  const [passcodeSuccess, setPasscodeSuccess] = useState('')
  const [isSubmittingPasscode, setIsSubmittingPasscode] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      setIsProfileLoading(true)
      setProfileError('')

      try {
        const profile = await getUserProfile()

        setProfileData(profile)

        setProfileForm({
          currentWeight: profile?.currentWeight ?? '',
          dailyCalorieGoal: profile?.dailyCalorieGoal ?? '',
          dailyProteinGoal: profile?.dailyProteinGoal ?? '',
          dailyCarbGoal: profile?.dailyCarbGoal ?? '',
          dailyFatGoal: profile?.dailyFatGoal ?? '',
          weightGoal: profile?.weightGoal ?? '',
          weeklyExerciseGoal: profile?.weeklyExerciseGoal ?? '',
          weeklyGymGoal: profile?.weeklyGymGoal ?? '',
        })
      } catch (err) {
        console.error(err)
        setProfileError('Could not load profile information.')
      } finally {
        setIsProfileLoading(false)
      }
    }

    loadProfile()
  }, [])

  const personalInfoRows = useMemo(
    () => [
      {
        key: 'weightGoal',
        label: 'Weight Goal',
        icon: <WeightGoalIcon />,
        suffix: 'kg',
      },
      {
        key: 'weeklyExerciseGoal',
        label: 'Weekly Exercise Goal',
        icon: <ExerciseGoalIcon />,
        suffix: 'mins',
      },
      {
        key: 'weeklyGymGoal',
        label: 'Weekly Gym Goal',
        icon: <GymGoalIcon />,
        suffix: 'sessions',
      },
      {
        key: 'dailyCalorieGoal',
        label: 'Daily Calorie Goal',
        icon: <CalorieGoalIcon />,
        suffix: 'kcal',
      },
      {
        key: 'dailyProteinGoal',
        label: 'Daily Protein Goal',
        icon: <ProteinGoalIcon />,
        suffix: 'g',
      },
      {
        key: 'dailyCarbGoal',
        label: 'Daily Carb Goal',
        icon: <CarbGoalIcon />,
        suffix: 'g',
      },
      {
        key: 'dailyFatGoal',
        label: 'Daily Fat Goal',
        icon: <FatGoalIcon />,
        suffix: 'g',
      },
    ],
    []
  )

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStartEditingProfile = () => {
    setProfileError('')
    setProfileSuccess('')
    setIsEditingProfile(true)
  }

  const handleCancelEditingProfile = () => {
    setProfileError('')
    setProfileSuccess('')
    setIsEditingProfile(false)

    setProfileForm({
      currentWeight: profileData?.currentWeight ?? '',
      dailyCalorieGoal: profileData?.dailyCalorieGoal ?? '',
      dailyProteinGoal: profileData?.dailyProteinGoal ?? '',
      dailyCarbGoal: profileData?.dailyCarbGoal ?? '',
      dailyFatGoal: profileData?.dailyFatGoal ?? '',
      weightGoal: profileData?.weightGoal ?? '',
      weeklyExerciseGoal: profileData?.weeklyExerciseGoal ?? '',
      weeklyGymGoal: profileData?.weeklyGymGoal ?? '',
    })
  }

  const handleSubmitProfile = async () => {
  setProfileError('')
  setProfileSuccess('')
  setIsSavingProfile(true)

  try {
    const profilePayload = {
      currentWeight: toNullableNumber(profileForm.currentWeight),
      dailyCalorieGoal: toNullableNumber(profileForm.dailyCalorieGoal),
      dailyProteinGoal: toNullableNumber(profileForm.dailyProteinGoal),
      dailyCarbGoal: toNullableNumber(profileForm.dailyCarbGoal),
      dailyFatGoal: toNullableNumber(profileForm.dailyFatGoal),
      weightGoal: toNullableNumber(profileForm.weightGoal),
      weeklyExerciseGoal: toNullableNumber(profileForm.weeklyExerciseGoal),
      weeklyGymGoal: toNullableNumber(profileForm.weeklyGymGoal),
    }

    const goalsHistoryPayload = {
      dailyCalorieGoal: toNullableNumber(profileForm.dailyCalorieGoal),
      dailyProteinGoal: toNullableNumber(profileForm.dailyProteinGoal),
      dailyCarbGoal: toNullableNumber(profileForm.dailyCarbGoal),
      dailyFatGoal: toNullableNumber(profileForm.dailyFatGoal),
      weightGoal: toNullableNumber(profileForm.weightGoal),
      weeklyExerciseGoal: toNullableNumber(profileForm.weeklyExerciseGoal),
    }

    await updateUserProfile(profilePayload)
    await createUserGoalsHistory(goalsHistoryPayload)

    const updatedProfile = {
      ...profileData,
      ...profilePayload,
    }

    setProfileData(updatedProfile)
    setProfileForm({
      currentWeight: updatedProfile.currentWeight ?? '',
      dailyCalorieGoal: updatedProfile.dailyCalorieGoal ?? '',
      dailyProteinGoal: updatedProfile.dailyProteinGoal ?? '',
      dailyCarbGoal: updatedProfile.dailyCarbGoal ?? '',
      dailyFatGoal: updatedProfile.dailyFatGoal ?? '',
      weightGoal: updatedProfile.weightGoal ?? '',
      weeklyExerciseGoal: updatedProfile.weeklyExerciseGoal ?? '',
      weeklyGymGoal: updatedProfile.weeklyGymGoal ?? '',
    })

    setIsEditingProfile(false)
    setProfileSuccess('Profile goals updated.')
  } catch (err) {
    console.error(err)
    setProfileError(err.response?.data?.message || 'Could not update profile.')
  } finally {
    setIsSavingProfile(false)
  }
}

  const handlePasscodeChange = (event) => {
    const { name, value } = event.target
    setPasscodeForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isPasscodeSubmitEnabled =
    passcodeForm.currentPasscode &&
    passcodeForm.newPasscode &&
    passcodeForm.confirmNewPasscode &&
    !isSubmittingPasscode

  const handlePasscodeSubmit = async (event) => {
    event.preventDefault()
    setPasscodeError('')
    setPasscodeSuccess('')

    if (passcodeForm.newPasscode.length < 6) {
      setPasscodeError('New passcode must be at least 6 characters.')
      return
    }

    if (passcodeForm.newPasscode !== passcodeForm.confirmNewPasscode) {
      setPasscodeError('New passcodes do not match.')
      return
    }

    setIsSubmittingPasscode(true)

    try {
      await changePasscode({
        currentPasscode: passcodeForm.currentPasscode,
        newPasscode: passcodeForm.newPasscode,
      })

      setPasscodeSuccess('Successfully changed passcode')

      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 1200)
    } catch (err) {
      console.error(err)
      setPasscodeError(
        err.response?.data?.message || 'Could not change passcode.'
      )
    } finally {
      setIsSubmittingPasscode(false)
    }
  }

  return (
    <div className="bg-slate-100 px-4 py-4">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => setIsPersonalOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
            <ChevronIcon isOpen={isPersonalOpen} />
          </button>

          <div
            className={`grid transition-all duration-300 ${
              isPersonalOpen ? 'grid-rows-[1fr] pt-4' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              {isProfileLoading ? (
                <p className="text-sm text-slate-500">Loading profile...</p>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-end">
                    {isEditingProfile ? (
                      <button
                        type="button"
                        onClick={handleCancelEditingProfile}
                        className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditingProfile}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {personalInfoRows.map((row) => (
                      <GoalRow
                        key={row.key}
                        label={row.label}
                        value={profileForm[row.key]}
                        icon={row.icon}
                        isEditing={isEditingProfile}
                        inputName={row.key}
                        onChange={handleProfileInputChange}
                        suffix={row.suffix}
                      />
                    ))}
                  </div>

                  {profileError ? (
                    <p className="mt-4 text-sm text-red-600">{profileError}</p>
                  ) : null}

                  {profileSuccess ? (
                    <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      {profileSuccess}
                    </div>
                  ) : null}

                  {isEditingProfile ? (
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={handleSubmitProfile}
                        disabled={isSavingProfile}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          isSavingProfile
                            ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm active:scale-[0.99]'
                        }`}
                      >
                        {isSavingProfile ? 'Saving...' : 'Submit'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => setIsPasscodeOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <LockIcon />
              <h2 className="text-lg font-semibold text-slate-900">
                Change Passcode
              </h2>
            </div>
            <ChevronIcon isOpen={isPasscodeOpen} />
          </button>

          <div
            className={`grid transition-all duration-300 ${
              isPasscodeOpen ? 'grid-rows-[1fr] pt-4' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Enter Old Passcode
                  </label>
                  <input
                    name="currentPasscode"
                    type="password"
                    value={passcodeForm.currentPasscode}
                    onChange={handlePasscodeChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Enter New Passcode
                  </label>
                  <input
                    name="newPasscode"
                    type="password"
                    value={passcodeForm.newPasscode}
                    onChange={handlePasscodeChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Re-Enter New Passcode
                  </label>
                  <input
                    name="confirmNewPasscode"
                    type="password"
                    value={passcodeForm.confirmNewPasscode}
                    onChange={handlePasscodeChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {passcodeError ? (
                  <p className="text-sm text-red-600">{passcodeError}</p>
                ) : null}

                {passcodeSuccess ? (
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                    {passcodeSuccess}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!isPasscodeSubmitEnabled}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    !isPasscodeSubmitEnabled
                      ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm active:scale-[0.99]'
                  }`}
                >
                  {isSubmittingPasscode ? 'Saving...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MorePage