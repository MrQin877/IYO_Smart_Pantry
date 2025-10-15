import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FoodFormModal from '../src/component/FoodFormModal'

// Mock the API module exactly as imported in your component
vi.mock('../src/lib/api', () => ({
  apiGet: vi.fn((url) => {
    if (url === '/categories_list.php') return Promise.resolve({ data: [{ id:'c1', name:'Grains' }] })
    if (url === '/units_list.php')      return Promise.resolve({ data: [{ id:'u1', name:'KG' }] })
    if (url === '/storages_list.php')   return Promise.resolve({ data: [{ id:'s1', name:'Pantry' }] })
    return Promise.resolve({ data: [] })
  }),
  apiPost: vi.fn(),
}))
import { apiPost } from '../src/lib/api'

const TODAY = '2025-10-15' // keep in sync with tests/setupTests.js clock if you set one

it('prefills and enables Add when initial is valid', async () => {
  render(
    <FoodFormModal
      open
      mode="add"
      initial={{ name:'Rice', qty:5, categoryID:'c1', unitID:'u1', storageID:'s1', expiry:TODAY }}
      onClose={() => {}}
      onSave={() => {}}
    />
  )

  // wait until options loaded & prefill applied
  expect(await screen.findByText(/Add Food/i)).toBeInTheDocument()

  // Use placeholder to find the input (no htmlFor/id in markup)
  const nameInput = screen.getByPlaceholderText(/Eg\. \(Egg\)/i)
  await waitFor(() => expect(nameInput).toHaveValue('Rice'))

  // date input: still queryable by label because it’s the only input in that row
  const expiryInput = await screen.findByDisplayValue(TODAY) // the date input currently shows TODAY
  expect(expiryInput).toBeInTheDocument()

  // Add should be enabled once required fields are set
  const addBtn = screen.getByRole('button', { name: /^Add$/i })
  expect(addBtn).toBeEnabled()
})

it('blocks save when expiry is in the past', async () => {
  render(
    <FoodFormModal
      open
      mode="add"
      initial={{ name:'Egg', qty:2, categoryID:'c1', unitID:'u1', expiry:'2025-10-10' }}
    />
  )
  await screen.findByText(/Add Food/i)
  expect(screen.getByRole('button', { name: /^Add$/i })).toBeDisabled()
  expect(screen.getByText(/Expiry cannot be in the past/i)).toBeInTheDocument()
})

it('posts payload and calls onSave (add mode)', async () => {
  apiPost.mockResolvedValueOnce({ ok:true, foodID:'F100' })
  const onSave = vi.fn()

  render(
    <FoodFormModal
      open
      mode="add"
      initial={{ name:'Bread', qty:3, categoryID:'c1', unitID:'u1', storageID:'s1', expiry:TODAY, remark:'Whole grain' }}
      onSave={onSave}
    />
  )

  const add = await screen.findByRole('button', { name: /^Add$/i })
  fireEvent.click(add)

  await waitFor(() => expect(apiPost).toHaveBeenCalledTimes(1))
  const [url, payload] = apiPost.mock.calls[0]
  expect(url).toBe('/food_add.php')
  // quantity is taken from initial.qty => 3
  expect(payload).toMatchObject({
    foodName: 'Bread',
    quantity: 3,
    expiryDate: TODAY,
    storageID: 's1',
    remark: 'Whole grain',
    categoryID: 'c1',
    unitID: 'u1',
  })

  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
  expect(onSave.mock.calls[0][0]).toMatchObject({
    foodID: 'F100',
    name: 'Bread',
    qty: 3,
    unit: 'KG',
    category: 'Grains',
    storageName: 'Pantry',
  })
})
