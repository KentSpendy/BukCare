import { useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'

export default function AvailabilityPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeat, setRepeat] = useState<'none' | 'weekly' | 'biweekly'>('none')

  const handleAdd = async () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      alert('Please fill in all fields.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const repeatGap = repeat === 'weekly' ? 7 : repeat === 'biweekly' ? 14 : 0

    const datesToCreate = []

    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + (repeatGap || 1))
    ) {
      datesToCreate.push(format(new Date(d), 'yyyy-MM-dd'))
    }

    try {
      await Promise.all(
        datesToCreate.map((date) =>
          api.post('/availabilities/', {
            date,
            start_time: startTime,
            end_time: endTime,
          })
        )
      )
      alert('Availability created.')
      // Optionally: refresh or reset form
    } catch (err) {
      console.error('Failed to create availability', err)
      alert('Failed to save.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Set Your Availability</h1>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Start Time</label>
          <input
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Time</label>
          <input
            type="time"
            className="input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Repeat</label>
          <select
            className="input"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as any)}
          >
            <option value="none">None</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Availability
        </button>
      </div>
    </div>
  )
}
