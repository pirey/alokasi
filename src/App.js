import React, { useState } from 'react'
import { Card, Form, InputGroup, ButtonGroup, Button } from 'react-bootstrap'
import { Icon } from 'react-icons-kit'
import { back, check, withPlus, withMinus } from 'react-icons-kit/entypo'
import accounting from 'accounting'
import Type from 'union-type'

const Action = Type({
  Iddle: [],
  AddExpense: [],
  AddIncome: []
})

function formatMoney(amount) {
  const precision = 0
  const decimal = ','
  const thousand = '.'
  return accounting.formatNumber(amount, {
    precision,
    thousand,
    decimal
  })
}

function parseMoney(amountString) {
  const decimal = ','
  return accounting.unformat(amountString, decimal)
}

function SingleInput(props) {
  const { label, readOnly, value, onChange, className } = props
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text
          className={`border-0 rounded-0 font-weight-bold text-uppercase ${
            readOnly ? '' : 'bg-white'
          } ${className ? className : ''}`}
        >
          {label}
        </InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control
        inputMode="number"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`border-0 rounded-0 text-right font-weight-bold ${
          className ? className : ''
        }`}
      />
    </InputGroup>
  )
}

function DualInput(props) {
  const { label, readOnly, value, onChangeValue, onChangeLabel } = props
  return (
    <InputGroup>
      <Form.Control
        value={label}
        onChange={onChangeLabel}
        readOnly={readOnly}
        className="border-0 rounded-0 font-weight-bold text-uppercase"
        placeholder="Nama Anggaran"
      />
      <Form.Control
        inputMode="number"
        value={value}
        onChange={onChangeValue}
        readOnly={readOnly}
        className="border-0 rounded-0 text-right font-weight-bold"
      />
    </InputGroup>
  )
}

function ExpenseList(props) {
  const { expenses } = props
  if (Object.keys(expenses).length <= 0) {
    return null
  }
  return (
    <>
      {Object.keys(expenses).map(key => (
        <SingleInput
          key={key}
          label={key}
          value={formatMoney(expenses[key])}
          readOnly
          className="text-danger"
        />
      ))}
    </>
  )
}

function IncomeList(props) {
  const { incomes } = props
  if (Object.keys(incomes).length <= 0) {
    return null
  }
  return (
    <>
      {Object.keys(incomes).map(key => (
        <SingleInput
          key={key}
          label={key}
          value={formatMoney(incomes[key])}
          readOnly
          className="text-success"
        />
      ))}
    </>
  )
}

function NewEntry(props) {
  const { onSave, onCancel } = props
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  const handleSave = () => {
    onSave([label, value])
  }

  return (
    <>
      <DualInput
        label={label}
        value={formatMoney(value)}
        onChangeValue={e => setValue(parseMoney(e.target.value))}
        onChangeLabel={e => setLabel(e.target.value)}
      />
      <ButtonGroup className="d-flex">
        <Button onClick={handleSave} variant="light" className="rounded-0">
          <Icon icon={check} className="text-primary" />
        </Button>
        <Button onClick={onCancel} variant="light">
          <Icon icon={back} />
        </Button>
      </ButtonGroup>
    </>
  )
}

function Remaining(props) {
  const { remaining } = props
  console.log(remaining)
  if (remaining > 0) {
    return (
      <Card.Footer className="fixed-bottom rounded-0 p-0">
        <SingleInput
          value={formatMoney(remaining)}
          readOnly
          label="SISA"
          className="text-success"
        />
      </Card.Footer>
    )
  }
  if (remaining < 0) {
    return (
      <Card.Footer className="fixed-bottom rounded-0 p-0">
        <SingleInput
          value={formatMoney(remaining)}
          readOnly
          label="KURANG"
          className="text-danger"
        />
      </Card.Footer>
    )
  }
  if (remaining === 0) {
    return (
      <Card.Footer className="fixed-bottom rounded-0 p-0">
        <SingleInput
          value=""
          readOnly
          label="SEMUA TERALOKASI"
          className="text-info"
        />
      </Card.Footer>
    )
  }

  return null
}

function App() {
  const [action, setAction] = useState(Action.Iddle)
  const [budget, setBudget] = useState('7000000')
  const [expenses, setExpenses] = useState({})
  const [incomes, setIncomes] = useState({})

  const sumReducer = (sum, item) => sum + item

  const calculateRemaining = () => {
    const totalExpense = Object.values(expenses).reduce(sumReducer, 0)
    const totalIncome = Object.values(incomes).reduce(sumReducer, 0)
    const totalRemaining = budget + totalIncome - totalExpense
    return totalRemaining
  }

  const setExpenseItem = (key, value) =>
    setExpenses({
      ...expenses,
      [key]: expenses[key] ? expenses[key] + value : value
    })

  const setIncomeItem = (key, value) =>
    setIncomes({
      ...incomes,
      [key]: incomes[key] ? incomes[key] + value : value
    })

  const closeNewEntry = () => {
    setAction(Action.Iddle)
  }

  const openExpenseNewEntry = () => {
    setAction(Action.AddExpense)
  }

  const openIncomeNewEntry = () => {
    setAction(Action.AddIncome)
  }

  const handleAddIncome = ([key, value]) => {
    if (key.trim() === '' || value.trim() === '') {
      return
    }
    setIncomeItem(key, value)
    setAction(Action.Iddle)
  }

  const handleAddExpense = ([key, value]) => {
    if (key.trim() === '' || value.trim() === '') {
      return
    }
    setExpenseItem(key, value)
    setAction(Action.Iddle)
  }

  return (
    <Card className="border-top-0 border-left-0 border-right-0 border-bottom-0">
      <Card.Header
        className="rounded-0 text-center font-weight-bold"
        style={{ backgroundColor: '#563d7c', color: 'white' }}
      >
        ALOKASI
      </Card.Header>
      <Card.Body className="p-0">
        <SingleInput
          label="SALDO"
          value={formatMoney(budget)}
          onChange={e => setBudget(parseMoney(e.target.value))}
          className="text-info"
        />
        {budget ? <IncomeList incomes={incomes} /> : null}
        {budget ? <ExpenseList expenses={expenses} /> : null}
        {budget
          ? Action.case({
              Iddle: () => (
                <ButtonGroup className="d-flex">
                  <Button
                    onClick={openIncomeNewEntry}
                    variant="light"
                    className="rounded-0"
                  >
                    <Icon icon={withPlus} className="text-success" />
                  </Button>
                  <Button
                    onClick={openExpenseNewEntry}
                    variant="light"
                    className="rounded-0"
                  >
                    <Icon icon={withMinus} className="text-danger" />
                  </Button>
                </ButtonGroup>
              ),
              AddExpense: () => (
                <NewEntry onSave={handleAddExpense} onCancel={closeNewEntry} />
              ),
              AddIncome: () => (
                <NewEntry onSave={handleAddIncome} onCancel={closeNewEntry} />
              )
            })(action)
          : null}
      </Card.Body>
      {budget ? <Remaining remaining={calculateRemaining()} /> : null}
    </Card>
  )
}

export default App
