import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import MenuIcon from './MenuSvg'
import {
  useDarkModeManager,
  useStakingManager,
  usePool2Manager,
  useDisplayUsdManager,
  useBorrowedManager,
  useHideLastDayManager
} from '../../contexts/LocalStorage'
import Switch from 'react-switch'
import HeadHelp from '../HeadHelp'
import { AutoRow } from '../Row'
import { useIsClient } from 'hooks'

import { TYPE } from '../../Theme'

const StyledMenuIcon = styled(MenuIcon)`
  svg {
    path {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
  svg {
    margin-top: 2px;
    path {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 9rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.6rem;
  right: 0rem;
  z-index: 100000;
`

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  display: inline;
  flex-direction: center;
  align-items: center;
  :hover {
    text-decoration: underline;
    text-decoration: none;
    opacity: 0.7;
  }
  :focus {
    outline: none;
    text-decoration: none;
  }
  :active {
    outline: none;
    text-decoration: none;
  }
`

const MenuItem = styled(StyledLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
    opacity: 0.6;
  }
  > svg {
    margin-right: 8px;
  }
`

export const OptionToggle = props => (
  <TYPE.body style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
    <Switch onChange={props.toggle} checked={props.enabled} height={20} width={40} />
    &nbsp;
    {props.help ? <HeadHelp title={props.name} text={props.help} /> : props.name}
  </TYPE.body>
)

export function CheckMarks({ type = 'defi' }) {
  const [stakingEnabled, toggleStaking] = useStakingManager()
  const [pool2Enabled, togglePool2] = usePool2Manager()
  const [borrowedEnabled, toggleBorrowed] = useBorrowedManager()
  const [displayUsd, toggleDisplayUsd] = useDisplayUsdManager()
  const [hideLastDay, toggleHideLastDay] = useHideLastDayManager()
  const router = useRouter()
  const isClient = useIsClient()

  const toggleSettings = {
    defi: [
      {
        name: 'Staking',
        toggle: toggleStaking,
        enabled: stakingEnabled && isClient,
        help: 'Include governance tokens staked in the protocol'
      },
      /*
      {
        name: 'Pool2',
        toggle: togglePool2,
        enabled: pool2Enabled && isClient,
        help: 'Include staked lp tokens where one of the coins in the pair is the governance token'
      },
      */
      {
        name: 'Borrows',
        toggle: toggleBorrowed,
        enabled: borrowedEnabled && isClient,
        help: 'Include borrowed coins in lending protocols'
      }
    ],
    nfts: [
      router.pathname !== '/nfts' && {
        name: 'Display in USD',
        toggle: toggleDisplayUsd,
        enabled: displayUsd && isClient,
        help: 'Display metrics in USD'
      },
      {
        name: 'Hide last day',
        toggle: toggleHideLastDay,
        enabled: hideLastDay && isClient,
        help: 'Hide the last day of data'
      }
    ]
  }

  return (
    <AutoRow gap="10px" justify="center">
      {toggleSettings[type].map(toggleSetting => {
        if (toggleSetting) {
          return <OptionToggle {...toggleSetting} key={toggleSetting.name} />
        }
        return <></>
      })}
    </AutoRow>
  )
}

export default function Menu({ type = 'defi' }) {
  const node = useRef()
  const [open, setOpen] = useState(false)
  const toggle = () => {
    setOpen(!open)
  }

  const handleClick = e => {
    if (!(node.current && node.current.contains(e.target))) {
      setOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
  //useOnClickOutside(node, open ? toggle : undefined)

  const [isDark, toggleDarkMode] = useDarkModeManager()
  const [stakingEnabled, toggleStaking] = useStakingManager()
  const [pool2Enabled, togglePool2] = usePool2Manager()
  const [borrowedEnabled, toggleBorrowed] = useBorrowedManager()
  const [displayUsd, toggleDisplayUsd] = useDisplayUsdManager()
  const [hideLastDay, toggleHideLastDay] = useHideLastDayManager()

  const toggleSettings = {
    defi: [
      {
        name: 'Staking',
        toggle: toggleStaking,
        enabled: stakingEnabled,
        help: 'Include governance tokens staked in the protocol'
      },
      {
        name: 'Pool2',
        toggle: togglePool2,
        enabled: pool2Enabled,
        help: 'Include staked lp tokens where one of the coins in the pair is the governance token'
      },
      {
        name: 'Borrows',
        toggle: toggleBorrowed,
        enabled: borrowedEnabled,
        help: 'Include borrowed coins in lending protocols'
      },
      {
        name: 'Dark mode',
        toggle: toggleDarkMode,
        enabled: isDark
      }
    ],
    nfts: [
      {
        name: 'Hide last day',
        toggle: toggleHideLastDay,
        enabled: hideLastDay,
        help: 'Hide the last day of data'
      },
      {
        name: 'Dark mode',
        toggle: toggleDarkMode,
        enabled: isDark
      }
    ]
  }

  const renderSettingsToggles = () => {
    return toggleSettings[type].map(toggleSetting => (
      <MenuItem>
        <OptionToggle {...toggleSetting} />
      </MenuItem>
    ))
  }

  return (
    <StyledMenu ref={node}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && <MenuFlyout>{renderSettingsToggles()}</MenuFlyout>}
    </StyledMenu>
  )
}
