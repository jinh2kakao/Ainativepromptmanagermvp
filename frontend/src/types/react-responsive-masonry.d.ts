declare module 'react-responsive-masonry' {
    import * as React from 'react';

    export interface MasonryProps {
        columnsCount?: number;
        gutter?: string;
        children: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }

    export interface ResponsiveMasonryProps {
        columnsCountBreakPoints?: { [key: number]: number };
        children: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }

    export class Masonry extends React.Component<MasonryProps> { }
    export class ResponsiveMasonry extends React.Component<ResponsiveMasonryProps> { }

    export default Masonry;
}
