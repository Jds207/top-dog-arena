import { z } from 'zod';
export declare const NFTMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    image: z.ZodString;
    attributes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        trait_type: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number;
        trait_type: string;
    }, {
        value: string | number;
        trait_type: string;
    }>, "many">>>;
    external_url: z.ZodOptional<z.ZodString>;
    animation_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    attributes: {
        value: string | number;
        trait_type: string;
    }[];
    image: string;
    external_url?: string | undefined;
    animation_url?: string | undefined;
}, {
    description: string;
    name: string;
    image: string;
    attributes?: {
        value: string | number;
        trait_type: string;
    }[] | undefined;
    external_url?: string | undefined;
    animation_url?: string | undefined;
}>;
export declare const CreateNFTSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    image: z.ZodString;
    attributes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        trait_type: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number;
        trait_type: string;
    }, {
        value: string | number;
        trait_type: string;
    }>, "many">>>;
    external_url: z.ZodOptional<z.ZodString>;
    animation_url: z.ZodOptional<z.ZodString>;
    transferFee: z.ZodOptional<z.ZodNumber>;
    recipient: z.ZodOptional<z.ZodString>;
    flags: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    attributes: {
        value: string | number;
        trait_type: string;
    }[];
    image: string;
    flags?: number | undefined;
    transferFee?: number | undefined;
    external_url?: string | undefined;
    animation_url?: string | undefined;
    recipient?: string | undefined;
}, {
    description: string;
    name: string;
    image: string;
    flags?: number | undefined;
    transferFee?: number | undefined;
    attributes?: {
        value: string | number;
        trait_type: string;
    }[] | undefined;
    external_url?: string | undefined;
    animation_url?: string | undefined;
    recipient?: string | undefined;
}>;
export declare const BatchCreateNFTsSchema: z.ZodObject<{
    nfts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        image: z.ZodString;
        attributes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            trait_type: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number;
            trait_type: string;
        }, {
            value: string | number;
            trait_type: string;
        }>, "many">>>;
        external_url: z.ZodOptional<z.ZodString>;
        animation_url: z.ZodOptional<z.ZodString>;
        transferFee: z.ZodOptional<z.ZodNumber>;
        recipient: z.ZodOptional<z.ZodString>;
        flags: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        attributes: {
            value: string | number;
            trait_type: string;
        }[];
        image: string;
        flags?: number | undefined;
        transferFee?: number | undefined;
        external_url?: string | undefined;
        animation_url?: string | undefined;
        recipient?: string | undefined;
    }, {
        description: string;
        name: string;
        image: string;
        flags?: number | undefined;
        transferFee?: number | undefined;
        attributes?: {
            value: string | number;
            trait_type: string;
        }[] | undefined;
        external_url?: string | undefined;
        animation_url?: string | undefined;
        recipient?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    nfts: {
        description: string;
        name: string;
        attributes: {
            value: string | number;
            trait_type: string;
        }[];
        image: string;
        flags?: number | undefined;
        transferFee?: number | undefined;
        external_url?: string | undefined;
        animation_url?: string | undefined;
        recipient?: string | undefined;
    }[];
}, {
    nfts: {
        description: string;
        name: string;
        image: string;
        flags?: number | undefined;
        transferFee?: number | undefined;
        attributes?: {
            value: string | number;
            trait_type: string;
        }[] | undefined;
        external_url?: string | undefined;
        animation_url?: string | undefined;
        recipient?: string | undefined;
    }[];
}>;
export declare const GetNFTByIdSchema: z.ZodObject<{
    nftId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nftId: string;
}, {
    nftId: string;
}>;
export declare const GetAccountNFTsSchema: z.ZodObject<{
    account: z.ZodString;
}, "strip", z.ZodTypeAny, {
    account: string;
}, {
    account: string;
}>;
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    marker: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    marker?: string | undefined;
}, {
    limit?: string | undefined;
    marker?: string | undefined;
}>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        field: string;
    }, {
        message: string;
        field: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    error: string;
    message: string;
    success: false;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}, {
    error: string;
    message: string;
    success: false;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}>;
export declare const SuccessResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodAny;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: true;
    data?: any;
}, {
    message: string;
    success: true;
    data?: any;
}>;
export type CreateNFTRequest = z.infer<typeof CreateNFTSchema>;
export type BatchCreateNFTsRequest = z.infer<typeof BatchCreateNFTsSchema>;
export type GetNFTByIdParams = z.infer<typeof GetNFTByIdSchema>;
export type GetAccountNFTsParams = z.infer<typeof GetAccountNFTsSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
//# sourceMappingURL=nft.validator.d.ts.map