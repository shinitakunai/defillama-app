import React from 'react'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import DefiLogo from '../../assets/logo_white_long.svg'
import NFTLogo from '../../assets/nft_logo_white_long.svg'
import Image from 'next/image'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`

const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

export default function Title({ homePath = '/' }) {
  return (
    <TitleWrapper>
      <Flex alignItems="center">
        <RowFixed>
          <UniIcon id="link" href={homePath}>
            <Image width="160px" height="54px" src={homePath === '/' ? DefiLogo : NFTLogo} alt="logo" priority={true} />
          </UniIcon>
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
