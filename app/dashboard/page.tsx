'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'

export default function DashboardPage() {

  const [language, setLanguage] = useState('en')

  const [rollId, setRollId] = useState('')
  const [vin, setVin] = useState('')
  const [installDate, setInstallDate] = useState('')

  const [filmTypes, setFilmTypes] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])

  const [selectedFilm, setSelectedFilm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  const [warrantyYears, setWarrantyYears] = useState('')

  const [showScanner, setShowScanner] =
    useState(false)

  const [showVinScanner, setShowVinScanner] =
    useState(false)

  const text = {
    en: {
      title: 'Eguard Warranty Registration',
      rollId: 'FILM ROLL ID',
      vin: 'VEHICLE VIN',
      filmType: 'SELECT FILM TYPE',
      warranty: 'WARRANTY YEARS',
      location: 'SELECT LOCATION',
      save: 'SAVE WARRANTY',
      fillAll: 'Please fill all fields',
      success: 'Warranty Registered Successfully',
      confirm: 'Please confirm warranty information',
      scanRoll: 'SCAN ROLL ID',
      scanVin: 'SCAN VIN',
    },

    ar: {
      title: 'تسجيل ضمان إي كارد',
      rollId: 'رقم الرولة',
      vin: 'رقم الشاصي',
      filmType: 'اختر نوع الفلم',
      warranty: 'سنوات الضمان',
      location: 'اختر الموقع',
      save: 'حفظ الضمان',
      fillAll: 'يرجى ملء جميع الحقول',
      success: 'تم تسجيل الضمان بنجاح',
      confirm: 'يرجى تأكيد معلومات الضمان',
      scanRoll: 'قراءة رقم الرولة',
      scanVin: 'قراءة رقم الشاصي',
    },
  }

  useEffect(() => {
    loadFilmTypes()
    loadLocations()
  }, [])

  const loadFilmTypes = async () => {

    const { data } = await supabase
      .from('film_types')
      .select('*')

    if (data) {
      setFilmTypes(data)
    }
  }

  const loadLocations = async () => {

    const { data } = await supabase
      .from('locations')
      .select('*')

    if (data) {
      setLocations(data)
    }
  }

  const handleFilmChange = (value: string) => {

    setSelectedFilm(value)

    const film = filmTypes.find(
      (f) => f.code === value
    )

    if (film) {
      setWarrantyYears(
        film.warranty_years.toString()
      )
    }
  }

  const handleSubmit = async (e: any) => {

    e.preventDefault()

    if (
      !rollId ||
      !vin ||
      !selectedFilm ||
      !installDate ||
      !warrantyYears ||
      !selectedLocation
    ) {
      alert(
        text[language as keyof typeof text].fillAll
      )
      return
    }

    const confirmed = confirm(
      `${text[language as keyof typeof text].confirm}

Film Roll ID: ${rollId}
Vehicle VIN: ${vin}
Film Type: ${selectedFilm}
Installation Date: ${installDate}
Warranty Years: ${warrantyYears}
Location: ${selectedLocation}
`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('installations')
      .insert([
        {
          film_roll_id: rollId,
          vin_number: vin,
          film_type: selectedFilm,
          install_date: installDate,
          warranty_years: Number(warrantyYears),
          installation_location: selectedLocation,
          city: selectedLocation,
          area: selectedLocation,
        },
      ])

    if (error) {

      alert(error.message)

    } else {

      alert(
        text[language as keyof typeof text].success
      )

      setRollId('')
      setVin('')
      setInstallDate('')
      setSelectedFilm('')
      setSelectedLocation('')
      setWarrantyYears('')
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <div className="flex justify-end mb-4 gap-2">

          <button
            onClick={() => setLanguage('en')}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            English
          </button>

          <button
            onClick={() => setLanguage('ar')}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            العربية
          </button>

        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">

          {text[language as keyof typeof text].title}

        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="space-y-2">

            <input
              type="text"
              placeholder={
                text[language as keyof typeof text]
                  .rollId
              }
              className="w-full border p-3 rounded-lg"
              value={rollId}
              onChange={(e) =>
                setRollId(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowScanner(!showScanner)
              }
              className="w-full bg-blue-600 text-white p-3 rounded-lg"
            >
              {
                text[language as keyof typeof text]
                  .scanRoll
              }
            </button>

            {showScanner && (

              <BarcodeScanner
                onScanSuccess={(decodedText) => {

                  setRollId(decodedText)

                  setShowScanner(false)
                }}
              />

            )}

          </div>

          <div className="space-y-2">

            <input
              type="text"
              placeholder={
                text[language as keyof typeof text].vin
              }
              className="w-full border p-3 rounded-lg"
              value={vin}
              onChange={(e) =>
                setVin(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowVinScanner(!showVinScanner)
              }
              className="w-full bg-green-600 text-white p-3 rounded-lg"
            >
              {
                text[language as keyof typeof text]
                  .scanVin
              }
            </button>

            {showVinScanner && (

              <BarcodeScanner
                onScanSuccess={(decodedText) => {

                  setVin(decodedText)

                  setShowVinScanner(false)
                }}
              />

            )}

          </div>

          <select
            className="w-full border p-3 rounded-lg"
            value={selectedFilm}
            onChange={(e) =>
              handleFilmChange(e.target.value)
            }
          >

            <option value="">
              {
                text[language as keyof typeof text]
                  .filmType
              }
            </option>

            {filmTypes.map((film) => (
              <option
                key={film.id}
                value={film.code}
              >
                {film.code} - {film.name}
              </option>
            ))}

          </select>

          <input
            type="date"
            className="w-full border p-3 rounded-lg"
            value={installDate}
            onChange={(e) =>
              setInstallDate(e.target.value)
            }
          />

          <input
            type="text"
            placeholder={
              text[language as keyof typeof text]
                .warranty
            }
            className="w-full border p-3 rounded-lg bg-gray-100"
            value={warrantyYears}
            readOnly
          />

          <select
            className="w-full border p-3 rounded-lg"
            value={selectedLocation}
            onChange={(e) =>
              setSelectedLocation(
                e.target.value
              )
            }
          >

            <option value="">
              {
                text[language as keyof typeof text]
                  .location
              }
            </option>

            {locations.map((location) => (
              <option
                key={location.id}
                value={location.name}
              >
                {location.name}
              </option>
            ))}

          </select>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            {text[language as keyof typeof text].save}
          </button>

        </form>

      </div>

    </main>
  )
}