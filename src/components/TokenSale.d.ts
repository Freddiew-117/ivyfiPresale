import { FC } from 'react';

interface TokenSaleProps {
  buyToken: (amount: number) => Promise<void>;
  tokenSold: string;
  tokenSaleBalance: string;
  presaleStatus: {
    isActive: boolean;
    timeRemaining: number;
  };
  tokenPrice: number;
  tokensForSale: string;
}

declare const TokenSale: FC<TokenSaleProps>;

export default TokenSale;