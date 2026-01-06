// @/components/ads/YandexBanner.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    AdRequestConfiguration,
    BannerAdSize,
    BannerView,
} from 'yandex-mobile-ads';

interface YandexBannerProps {
    adUnitId?: string;
    style?: any;
}

export const YandexBanner: React.FC<YandexBannerProps> = ({
    adUnitId = 'R-M-17805543-1', // ID de teste, substitua pelo seu ID real
    style,
}) => {
    const [bannerSize, setBannerSize] = useState<BannerAdSize | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadBannerSize();
    }, []);

    const loadBannerSize = async () => {
        try {
            const size = await BannerAdSize.stickySize(320);
            setBannerSize(size);
        } catch (error) {
            console.error('Erro ao carregar tamanho do banner:', error);
        }
    };

    if (!bannerSize) {
        return null;
    }

    return (
        <View style={[styles.container, style]}>
            <BannerView
                size={bannerSize}
                adUnitId={adUnitId}
                // CORREÇÃO 1: Instanciando AdRequestConfiguration diretamente
                adRequest={
                    new AdRequestConfiguration({
                        adUnitId: adUnitId,
                    })
                }
                onAdLoaded={() => {
                    console.log('✅ Banner Yandex carregado com sucesso');
                    setIsLoaded(true);
                }}
                // CORREÇÃO 2: Definindo o tipo do evento como 'any'
                onAdFailedToLoad={(event: any) => {
                    console.error('❌ Erro ao carregar banner Yandex:', event.nativeEvent);
                    setIsLoaded(false);
                }}
                onAdClicked={() => {
                    console.log('🖱️ Banner Yandex clicado');
                }}
                // CORREÇÃO 2: Definindo o tipo do evento como 'any'
                onAdImpression={(event: any) => {
                    console.log('👁️ Banner Yandex impressão:', event.nativeEvent);
                }}
                style={styles.banner}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    banner: {
        width: '100%',
        alignSelf: 'center',
    },
});