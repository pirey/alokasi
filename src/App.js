import React, { useState } from 'react'
import { Card, Form, InputGroup, ButtonGroup, Button } from 'react-bootstrap'
import { Icon } from 'react-icons-kit'
import { back, check, withPlus, withMinus } from 'react-icons-kit/entypo'
import accounting from 'accounting'
import Type from 'union-type'

const Action = Type({
  Iddle: [],
  AddExpense: [Object],
  AddIncome: [Object]
})

function formatMoney(amount) {
  const precision = 0
  const decimal = ','
  const separator = '.'
  return accounting.formatNumber(amount, precision, separator, decimal)
}

function parseMoney(amountString) {
  const decimal = ','
  return accounting.unformat(amountString, decimal)
}

function AmountInput(props) {
  const { label, readOnly, value, onChange } = props
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text
          className={`border-0 rounded-0 font-weight-bold ${
            readOnly ? '' : 'bg-white'
          }`}
        >
          {label}
        </InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control
        value={formatMoney(value)}
        onChange={onChange}
        readOnly={readOnly}
        className="border-0 rounded-0 text-right font-weight-bold"
      />
    </InputGroup>
  )
}

function App() {
  const [budget, setBudget] = useState('')
  const [expenses, setExpenses] = useState({})
  const [incomes, setIncomes] = useState({})

  const [newEntry, setNewEntry] = useState('')

  const [action, setAction] = useState(Action.Iddle)

  const setExpense = (key, value) => setExpenses({ ...expenses, [key]: value })
  // eslint-disable-next-line
  const setIncome = (key, value) => setIncomes({ ...incomes, [key]: value })

  // eslint-disable-next-line
  const handleNewEntryExpense = e => {
    setAction(
      Action.AddExpense({
        label: 'My Expense',
        value: formatMoney(newEntry),
        onChangeValue: e => setNewEntry(parseMoney(e.target.value))
      })
    )
  }

  // eslint-disable-next-line
  const handleAddExpense = (key, value) => {
    setExpense(key, value)
    setNewEntry('')
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
        <AmountInput
          label="ANGGARAN"
          value={budget}
          onChange={e => setBudget(parseMoney(e.target.value))}
        />
        {budget
          ? Action.case({
              Iddle: () => (
                <ButtonGroup className="d-flex">
                  <Button onClick={handleNewEntryExpense} variant="light" className="rounded-0">
                    <Icon icon={withPlus} className="text-success" />
                  </Button>
                  <Button variant="light" className="rounded-0">
                    <Icon icon={withMinus} className="text-danger" />
                  </Button>
                </ButtonGroup>
              ),
              AddExpense: ({ label, onChangeLabel, value, onChangeValue }) => (
                <>
                  <AmountInput
                    label={label}
                    value={value}
                    onChange={onChangeValue}
                  />
                <ButtonGroup className="d-flex">
                  <Button onClick={handleAddExpense} variant="light" className="rounded-0">
                    <Icon icon={check} className="text-primary" />
                  </Button>
                  <Button variant="light">
                    <Icon icon={back} />
                  </Button>
                </ButtonGroup>
                </>
              ),
              AddIncome: ({ label, onChangeLabel, value, onChangeValue }) => (
                <AmountInput
                  label={label}
                  value={value}
                  onChange={onChangeValue}
                />
              )
            })(action)
          : null}
      </Card.Body>
      {budget ? (
        <Card.Footer className="fixed-bottom rounded-0 p-0">
          <AmountInput readOnly label="SISA" />
        </Card.Footer>
      ) : null}
    </Card>
  )
}

export default App
