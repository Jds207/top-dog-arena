export declare class DatabaseService {
    private prisma;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    createAccount(data: {
        address: string;
        network?: string;
        publicKey?: string;
        isOwned?: boolean;
        nickname?: string;
        description?: string;
    }): Promise<{
        id: string;
        address: string;
        seed: string | null;
        publicKey: string | null;
        privateKey: string | null;
        network: string;
        balance: string | null;
        balanceXRP: string | null;
        isOwned: boolean;
        isActive: boolean;
        nickname: string | null;
        description: string | null;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
    }>;
    getAccount(address: string): Promise<({
        nftsOwned: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
            name: string | null;
            nftTokenID: string;
            issuerAddress: string;
            ownerAddress: string;
            flags: number | null;
            transferFee: number | null;
            nftTaxon: number | null;
            nftSerial: number | null;
            uri: string | null;
            imageUrl: string | null;
            imageHash: string | null;
            animationUrl: string | null;
            externalUrl: string | null;
            attributes: string | null;
            txHash: string | null;
            ledgerIndex: number | null;
            fee: string | null;
            isBurned: boolean;
            isTransferable: boolean;
            isWrapped: boolean;
            songbirdTokenId: string | null;
            wrapTransactionHash: string | null;
            unwrapTransactionHash: string | null;
            wrappedAt: Date | null;
            unwrappedAt: Date | null;
            category: string | null;
            rarity: string | null;
            season: string | null;
            player: string | null;
            team: string | null;
            position: string | null;
            isForSale: boolean;
            priceXRP: string | null;
            priceDrop: string | null;
            marketplaceUrl: string | null;
            mintedAt: Date | null;
        }[];
        nftsIssued: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
            name: string | null;
            nftTokenID: string;
            issuerAddress: string;
            ownerAddress: string;
            flags: number | null;
            transferFee: number | null;
            nftTaxon: number | null;
            nftSerial: number | null;
            uri: string | null;
            imageUrl: string | null;
            imageHash: string | null;
            animationUrl: string | null;
            externalUrl: string | null;
            attributes: string | null;
            txHash: string | null;
            ledgerIndex: number | null;
            fee: string | null;
            isBurned: boolean;
            isTransferable: boolean;
            isWrapped: boolean;
            songbirdTokenId: string | null;
            wrapTransactionHash: string | null;
            unwrapTransactionHash: string | null;
            wrappedAt: Date | null;
            unwrappedAt: Date | null;
            category: string | null;
            rarity: string | null;
            season: string | null;
            player: string | null;
            team: string | null;
            position: string | null;
            isForSale: boolean;
            priceXRP: string | null;
            priceDrop: string | null;
            marketplaceUrl: string | null;
            mintedAt: Date | null;
        }[];
    } & {
        id: string;
        address: string;
        seed: string | null;
        publicKey: string | null;
        privateKey: string | null;
        network: string;
        balance: string | null;
        balanceXRP: string | null;
        isOwned: boolean;
        isActive: boolean;
        nickname: string | null;
        description: string | null;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
    }) | null>;
    updateAccountBalance(address: string, balance: string, balanceXRP: string): Promise<void>;
    saveAccount(data: {
        address: string;
        network?: string;
        publicKey?: string;
        isOwned?: boolean;
        nickname?: string;
        description?: string;
        metadata?: any;
    }): Promise<{
        id: string;
        address: string;
        seed: string | null;
        publicKey: string | null;
        privateKey: string | null;
        network: string;
        balance: string | null;
        balanceXRP: string | null;
        isOwned: boolean;
        isActive: boolean;
        nickname: string | null;
        description: string | null;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
    }>;
    updateAccount(address: string, updates: {
        nickname?: string;
        description?: string;
        tags?: string;
        metadata?: any;
    }): Promise<{
        id: string;
        address: string;
        seed: string | null;
        publicKey: string | null;
        privateKey: string | null;
        network: string;
        balance: string | null;
        balanceXRP: string | null;
        isOwned: boolean;
        isActive: boolean;
        nickname: string | null;
        description: string | null;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
    }>;
    getAllAccounts(limit?: number): Promise<({
        nftsOwned: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
            name: string | null;
            nftTokenID: string;
            issuerAddress: string;
            ownerAddress: string;
            flags: number | null;
            transferFee: number | null;
            nftTaxon: number | null;
            nftSerial: number | null;
            uri: string | null;
            imageUrl: string | null;
            imageHash: string | null;
            animationUrl: string | null;
            externalUrl: string | null;
            attributes: string | null;
            txHash: string | null;
            ledgerIndex: number | null;
            fee: string | null;
            isBurned: boolean;
            isTransferable: boolean;
            isWrapped: boolean;
            songbirdTokenId: string | null;
            wrapTransactionHash: string | null;
            unwrapTransactionHash: string | null;
            wrappedAt: Date | null;
            unwrappedAt: Date | null;
            category: string | null;
            rarity: string | null;
            season: string | null;
            player: string | null;
            team: string | null;
            position: string | null;
            isForSale: boolean;
            priceXRP: string | null;
            priceDrop: string | null;
            marketplaceUrl: string | null;
            mintedAt: Date | null;
        }[];
        nftsIssued: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
            name: string | null;
            nftTokenID: string;
            issuerAddress: string;
            ownerAddress: string;
            flags: number | null;
            transferFee: number | null;
            nftTaxon: number | null;
            nftSerial: number | null;
            uri: string | null;
            imageUrl: string | null;
            imageHash: string | null;
            animationUrl: string | null;
            externalUrl: string | null;
            attributes: string | null;
            txHash: string | null;
            ledgerIndex: number | null;
            fee: string | null;
            isBurned: boolean;
            isTransferable: boolean;
            isWrapped: boolean;
            songbirdTokenId: string | null;
            wrapTransactionHash: string | null;
            unwrapTransactionHash: string | null;
            wrappedAt: Date | null;
            unwrappedAt: Date | null;
            category: string | null;
            rarity: string | null;
            season: string | null;
            player: string | null;
            team: string | null;
            position: string | null;
            isForSale: boolean;
            priceXRP: string | null;
            priceDrop: string | null;
            marketplaceUrl: string | null;
            mintedAt: Date | null;
        }[];
    } & {
        id: string;
        address: string;
        seed: string | null;
        publicKey: string | null;
        privateKey: string | null;
        network: string;
        balance: string | null;
        balanceXRP: string | null;
        isOwned: boolean;
        isActive: boolean;
        nickname: string | null;
        description: string | null;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
    })[]>;
    createNFT(data: {
        nftTokenID: string;
        issuerAddress: string;
        ownerAddress: string;
        flags?: number;
        transferFee?: number;
        nftTaxon?: number;
        nftSerial?: number;
        uri?: string;
        name?: string;
        description?: string;
        imageUrl?: string;
        attributes?: string;
        txHash?: string;
        ledgerIndex?: number;
        fee?: string;
        category?: string;
        rarity?: string;
        mintedAt?: Date;
    }): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
        name: string | null;
        nftTokenID: string;
        issuerAddress: string;
        ownerAddress: string;
        flags: number | null;
        transferFee: number | null;
        nftTaxon: number | null;
        nftSerial: number | null;
        uri: string | null;
        imageUrl: string | null;
        imageHash: string | null;
        animationUrl: string | null;
        externalUrl: string | null;
        attributes: string | null;
        txHash: string | null;
        ledgerIndex: number | null;
        fee: string | null;
        isBurned: boolean;
        isTransferable: boolean;
        isWrapped: boolean;
        songbirdTokenId: string | null;
        wrapTransactionHash: string | null;
        unwrapTransactionHash: string | null;
        wrappedAt: Date | null;
        unwrappedAt: Date | null;
        category: string | null;
        rarity: string | null;
        season: string | null;
        player: string | null;
        team: string | null;
        position: string | null;
        isForSale: boolean;
        priceXRP: string | null;
        priceDrop: string | null;
        marketplaceUrl: string | null;
        mintedAt: Date | null;
    }>;
    getNFT(nftTokenID: string): Promise<({
        issuer: {
            id: string;
            address: string;
            seed: string | null;
            publicKey: string | null;
            privateKey: string | null;
            network: string;
            balance: string | null;
            balanceXRP: string | null;
            isOwned: boolean;
            isActive: boolean;
            nickname: string | null;
            description: string | null;
            tags: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
        };
        owner: {
            id: string;
            address: string;
            seed: string | null;
            publicKey: string | null;
            privateKey: string | null;
            network: string;
            balance: string | null;
            balanceXRP: string | null;
            isOwned: boolean;
            isActive: boolean;
            nickname: string | null;
            description: string | null;
            tags: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
        name: string | null;
        nftTokenID: string;
        issuerAddress: string;
        ownerAddress: string;
        flags: number | null;
        transferFee: number | null;
        nftTaxon: number | null;
        nftSerial: number | null;
        uri: string | null;
        imageUrl: string | null;
        imageHash: string | null;
        animationUrl: string | null;
        externalUrl: string | null;
        attributes: string | null;
        txHash: string | null;
        ledgerIndex: number | null;
        fee: string | null;
        isBurned: boolean;
        isTransferable: boolean;
        isWrapped: boolean;
        songbirdTokenId: string | null;
        wrapTransactionHash: string | null;
        unwrapTransactionHash: string | null;
        wrappedAt: Date | null;
        unwrappedAt: Date | null;
        category: string | null;
        rarity: string | null;
        season: string | null;
        player: string | null;
        team: string | null;
        position: string | null;
        isForSale: boolean;
        priceXRP: string | null;
        priceDrop: string | null;
        marketplaceUrl: string | null;
        mintedAt: Date | null;
    }) | null>;
    getNFTsByOwner(ownerAddress: string, limit?: number, offset?: number): Promise<({
        issuer: {
            id: string;
            address: string;
            seed: string | null;
            publicKey: string | null;
            privateKey: string | null;
            network: string;
            balance: string | null;
            balanceXRP: string | null;
            isOwned: boolean;
            isActive: boolean;
            nickname: string | null;
            description: string | null;
            tags: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
        name: string | null;
        nftTokenID: string;
        issuerAddress: string;
        ownerAddress: string;
        flags: number | null;
        transferFee: number | null;
        nftTaxon: number | null;
        nftSerial: number | null;
        uri: string | null;
        imageUrl: string | null;
        imageHash: string | null;
        animationUrl: string | null;
        externalUrl: string | null;
        attributes: string | null;
        txHash: string | null;
        ledgerIndex: number | null;
        fee: string | null;
        isBurned: boolean;
        isTransferable: boolean;
        isWrapped: boolean;
        songbirdTokenId: string | null;
        wrapTransactionHash: string | null;
        unwrapTransactionHash: string | null;
        wrappedAt: Date | null;
        unwrappedAt: Date | null;
        category: string | null;
        rarity: string | null;
        season: string | null;
        player: string | null;
        team: string | null;
        position: string | null;
        isForSale: boolean;
        priceXRP: string | null;
        priceDrop: string | null;
        marketplaceUrl: string | null;
        mintedAt: Date | null;
    })[]>;
    getNFTsByIssuer(issuerAddress: string, limit?: number, offset?: number): Promise<({
        owner: {
            id: string;
            address: string;
            seed: string | null;
            publicKey: string | null;
            privateKey: string | null;
            network: string;
            balance: string | null;
            balanceXRP: string | null;
            isOwned: boolean;
            isActive: boolean;
            nickname: string | null;
            description: string | null;
            tags: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastSyncAt: Date | null;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
        name: string | null;
        nftTokenID: string;
        issuerAddress: string;
        ownerAddress: string;
        flags: number | null;
        transferFee: number | null;
        nftTaxon: number | null;
        nftSerial: number | null;
        uri: string | null;
        imageUrl: string | null;
        imageHash: string | null;
        animationUrl: string | null;
        externalUrl: string | null;
        attributes: string | null;
        txHash: string | null;
        ledgerIndex: number | null;
        fee: string | null;
        isBurned: boolean;
        isTransferable: boolean;
        isWrapped: boolean;
        songbirdTokenId: string | null;
        wrapTransactionHash: string | null;
        unwrapTransactionHash: string | null;
        wrappedAt: Date | null;
        unwrappedAt: Date | null;
        category: string | null;
        rarity: string | null;
        season: string | null;
        player: string | null;
        team: string | null;
        position: string | null;
        isForSale: boolean;
        priceXRP: string | null;
        priceDrop: string | null;
        marketplaceUrl: string | null;
        mintedAt: Date | null;
    })[]>;
    updateNFTOwner(nftTokenID: string, newOwnerAddress: string): Promise<void>;
    updateNFTStatus(nftTokenID: string, updates: {
        isWrapped?: boolean;
        songbirdTokenId?: string;
        wrapTransactionHash?: string;
        unwrapTransactionHash?: string;
        wrappedAt?: Date;
        unwrappedAt?: Date;
    }): Promise<void>;
    burnNFT(nftTokenID: string): Promise<void>;
    logTransaction(data: {
        txHash: string;
        txType: string;
        account: string;
        fee: string;
        sequence?: number;
        ledgerIndex?: number;
        nftTokenID?: string;
        amount?: string;
        destination?: string;
        validated?: boolean;
        successful?: boolean;
        errorCode?: string;
        errorMessage?: string;
        memo?: string;
        metadata?: string;
        submittedAt?: Date;
        validatedAt?: Date;
    }): Promise<{
        account: string;
        id: string;
        createdAt: Date;
        nftTokenID: string | null;
        txHash: string;
        ledgerIndex: number | null;
        fee: string;
        txType: string;
        sequence: number | null;
        amount: string | null;
        destination: string | null;
        validated: boolean;
        successful: boolean;
        errorCode: string | null;
        errorMessage: string | null;
        memo: string | null;
        metadata: string | null;
        submittedAt: Date | null;
        validatedAt: Date | null;
    }>;
    getTransaction(txHash: string): Promise<{
        account: string;
        id: string;
        createdAt: Date;
        nftTokenID: string | null;
        txHash: string;
        ledgerIndex: number | null;
        fee: string;
        txType: string;
        sequence: number | null;
        amount: string | null;
        destination: string | null;
        validated: boolean;
        successful: boolean;
        errorCode: string | null;
        errorMessage: string | null;
        memo: string | null;
        metadata: string | null;
        submittedAt: Date | null;
        validatedAt: Date | null;
    } | null>;
    getNFTStats(): Promise<{
        totalNFTs: number;
        activeNFTs: number;
        burnedNFTs: number;
        totalAccounts: number;
        recentMints: number;
    }>;
    healthCheck(): Promise<{
        connected: boolean;
        responseTime: number;
    }>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=database.service.d.ts.map