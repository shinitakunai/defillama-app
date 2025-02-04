import React, { useMemo, useState, useRef } from 'react'
import { Box } from 'rebass/styled-components'
import { PieChart, Pie, Sector, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import styled from 'styled-components'

import { PageWrapper, FullWrapper } from 'components'
import { ButtonDark } from 'components/ButtonStyled'
import Panel from 'components/Panel'
import { RowBetween } from 'components/Row'
import Search from 'components/Search'
import TokenList from 'components/TokenList'
import { GeneralLayout } from 'layout'
import { Header } from 'Theme'

import { PROTOCOLS_API, CHART_API, CONFIG_API } from 'constants/index'
import { useCalcStakePool2Tvl } from 'hooks/data'
import { useLg, useMed } from 'hooks/useBreakpoints'
import { toK, toNiceCsvDate, toNiceDateYear, formattedNum, toNiceMonthlyDate, chainIconUrl } from 'utils'
import { revalidate } from 'utils/dataApi'

function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function getPercentChange(previous, current) {
  return (current / previous) * 100 - 100
}

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`

const getPercent = (value, total) => {
  const ratio = total > 0 ? value / total : 0

  return toPercent(ratio, 2)
}

function download(filename, text) {
  var element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const renderActiveShape = props => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, percent, value } = props
  const fill = payload.color
  const sector1 = (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
  const sector2 = (
    <Sector
      cx={cx}
      cy={cy}
      startAngle={startAngle}
      endAngle={endAngle}
      innerRadius={outerRadius + 6}
      outerRadius={outerRadius + 10}
      fill={fill}
    />
  )
  if (outerRadius < 110) {
    return (
      <>
        {sector1}
        {sector2}
        <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={'white'}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={-8 + 18} textAnchor="middle" fill={'white'}>
          {`${toK(value)}`}
        </text>
        <text x={cx} y={cy} dy={-8 + 18 * 2} textAnchor="middle" fill={'white'}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </>
    )
  }
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={'white'}>
        {payload.name}
      </text>
      {sector1}
      {sector2}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#777">{`TVL ${toK(value)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}
const ChainPieChart = ({ data, isMobile, chainColor }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }
  const coloredData = data.map(c => ({ ...c, color: chainColor[c.name] }))
  return (
    <ChartWrapper isMobile={isMobile}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={coloredData}
          cx="50%"
          cy="47%"
          innerRadius={'60%'}
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={coloredData[index].color} />
          ))}
        </Pie>
      </PieChart>
    </ChartWrapper>
  )
}

const PlaceholderChartPanel = styled(Panel)`
  padding-bottom: 28%;
  height: 100%;
  @media (max-width: 800px) {
    padding-bottom: 69%;
  }
`

const ChartWrapper = ({ children, isMobile }) => {
  const ref = useRef()
  return (
    <PlaceholderChartPanel
      style={{
        margin: !isMobile && '0.3em'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 10
        }}
      >
        <ResponsiveContainer
          width={ref?.current?.container?.clientWidth}
          height={ref?.current?.container?.clientHeight}
        >
          {children}
        </ResponsiveContainer>
      </div>
    </PlaceholderChartPanel>
  )
}

const StackedChart = ({
  stackOffset,
  yFormatter,
  formatPercent,
  stackedDataset,
  chainsUnique,
  chainColor,
  daySum,
  isMobile
}) => (
  <ChartWrapper isMobile={isMobile}>
    <AreaChart
      data={stackedDataset}
      stackOffset={stackOffset}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0
      }}
    >
      <XAxis dataKey="date" tickFormatter={toNiceMonthlyDate} />
      <YAxis tickFormatter={tick => yFormatter(tick)} />
      <Tooltip
        formatter={(val, chain, props) =>
          formatPercent ? getPercent(val, daySum[props.payload.date]) : formattedNum(val)
        }
        labelFormatter={label => toNiceDateYear(label)}
        itemSorter={p => -p.value}
      />
      {chainsUnique.map(chainName => (
        <Area
          type="monotone"
          dataKey={chainName}
          key={chainName}
          stackId="1"
          fill={chainColor[chainName]}
          stroke={chainColor[chainName]}
        />
      ))}
    </AreaChart>
  </ChartWrapper>
)

const ChartBreakPoints = styled(Box)`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  padding: 0;
  align-items: center;
  @media (max-width: 800px) {
    display: grid;
    grid-auto-rows: auto;
  }
`

const ChainsView = ({ chainsUnique, chainTvls, stackedDataset, daySum, currentData }) => {
  const isMobile = useMed()
  const isLg = useLg()

  const chainColor = useMemo(
    () => Object.fromEntries([...chainsUnique, 'Other'].map(chain => [chain, getRandomColor()])),
    [chainsUnique]
  )

  function downloadCsv() {
    const rows = [['Timestamp', 'Date', ...chainsUnique]]
    stackedDataset
      .sort((a, b) => a.date - b.date)
      .forEach(day => {
        rows.push([day.date, toNiceCsvDate(day.date), ...chainsUnique.map(chain => day[chain] ?? '')])
      })
    download('chains.csv', rows.map(r => r.join(',')).join('\n'))
  }

  const protocolTotals = useCalcStakePool2Tvl(chainTvls)

  const stackedChart = <ChainPieChart yFormatter={toK} data={currentData} chainColor={chainColor} isMobile={isMobile} />
  const dominanceChart = (
    <StackedChart
      stackOffset="expand"
      yFormatter={toPercent}
      formatPercent={true}
      stackedDataset={stackedDataset}
      chainsUnique={chainsUnique}
      chainColor={chainColor}
      daySum={daySum}
      isMobile={isMobile}
    />
  )
  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <Header>Total Value Locked All Chains</Header>
          <Search small={!isLg} />
        </RowBetween>

        <ChartBreakPoints>
          {stackedChart}
          {dominanceChart}
        </ChartBreakPoints>
        <TokenList
          canBookmark={false}
          tokens={protocolTotals}
          iconUrl={chainIconUrl}
          generateLink={name => `/chain/${name}`}
          columns={[undefined, 'protocols', 'change_1d', 'change_7d']}
        />
        <div style={{ margin: 'auto' }}>
          <ButtonDark onClick={downloadCsv}>Download all data in .csv</ButtonDark>
        </div>
      </FullWrapper>
    </PageWrapper>
  )
}

export async function getStaticProps() {
  const [res, { chainCoingeckoIds }] = await Promise.all([PROTOCOLS_API, CONFIG_API].map(apiEndpoint => fetch(apiEndpoint).then(r => r.json())))
  const chainsUnique = res.chains.filter(c => c !== "EthereumClassic") // TODO remove filter

  const chainCalls = Promise.all(chainsUnique.map(elem => fetch(`${CHART_API}/${elem}`).then(resp => resp.json())))
  const chainMcapsPromise = fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(chainCoingeckoIds)
      .map(v => v.geckoId)
      .join(',')}&vs_currencies=usd&include_market_cap=true`
  ).then(res => res.json())
  const numProtocolsPerChain = {}
  const stakingPerChain = {}
  const pool2PerChain = {}
  const borrowedPerChain = {}

  res.protocols.forEach(protocol => {
    protocol.chains.forEach(chain => {
      numProtocolsPerChain[chain] = (numProtocolsPerChain[chain] || 0) + 1
    })
    Object.entries(protocol.chainTvls).forEach(([tvlKey, tvlValue]) => {
      if (tvlKey.includes('-staking')) {
        const chain = tvlKey.split('-')[0]
        stakingPerChain[chain] = (stakingPerChain[chain] || 0) + tvlValue
      } else if (tvlKey.includes('-pool2')) {
        const chain = tvlKey.split('-')[0]
        pool2PerChain[chain] = (pool2PerChain[chain] || 0) + tvlValue
      } else if (tvlKey.includes('-borrowed')) {
        const chain = tvlKey.split('-')[0]
        borrowedPerChain[chain] = (borrowedPerChain[chain] || 0) + tvlValue
      }
    })
  })

  const data = await chainCalls
  const chainMcaps = await chainMcapsPromise

  const chainTvls = chainsUnique.map((chainName, i) => {
    const prevTvl = daysBefore => data[i][data[i].length - 1 - daysBefore]?.totalLiquidityUSD
    const current = prevTvl(0)
    const mcap = chainMcaps[chainCoingeckoIds[chainName]?.geckoId]?.usd_market_cap
    return {
      tvl: current,
      mcaptvl: mcap ? mcap / current : null,
      name: chainName,
      symbol: chainCoingeckoIds[chainName]?.symbol ?? '-',
      protocols: numProtocolsPerChain[chainName],
      pool2: pool2PerChain[chainName] || 0,
      borrowed: borrowedPerChain[chainName] || 0,
      staking: stakingPerChain[chainName] || 0,
      change_1d: prevTvl(1) ? getPercentChange(prevTvl(1), current) : null,
      change_7d: prevTvl(7) ? getPercentChange(prevTvl(7), current) : null
    }
  }).sort((a, b) => b.tvl - a.tvl)

  const daySum = {}
  const stackedDataset = Object.values(
    data.reduce((total, chain, i) => {
      const chainName = chainsUnique[i]
      chain.forEach(dayTvl => {
        if (dayTvl.date < 1596248105) return
        if (total[dayTvl.date] === undefined) {
          total[dayTvl.date] = { date: dayTvl.date }
        }
        total[dayTvl.date][chainName] = dayTvl.totalLiquidityUSD
        daySum[dayTvl.date] = (daySum[dayTvl.date] || 0) + dayTvl.totalLiquidityUSD
      })
      return total
    }, {})
  )

  const lastData = Object.entries(stackedDataset[stackedDataset.length - 1]).sort((a, b) => b[1] - a[1])

  const otherTvl = lastData.slice(10).reduce((total, entry) => {
    return entry[0] === 'date' ? total : total + entry[1]
  }, 0)
  const currentData = lastData
    .slice(0, 10)
    .concat([['Other', otherTvl]])
    .map(entry => ({ name: entry[0], value: entry[1] }))
  return {
    props: {
      chainsUnique,
      chainTvls,
      stackedDataset,
      daySum,
      currentData
    },
    revalidate: revalidate()
  }
}

export default function Chains(props) {
  return (
    <GeneralLayout title={`Chain TVL - DefiLlama`}>
      <ChainsView {...props} />
    </GeneralLayout>
  )
}
