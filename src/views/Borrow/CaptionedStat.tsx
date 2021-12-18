import { Grid, GridSpacing, Typography } from "@material-ui/core";

export interface CaptionedStatProps {
  stat: string;
  caption: string;
  spacing?: GridSpacing;
}

const CaptionedStat = ({ stat, caption, spacing }: CaptionedStatProps) => {
  return (
    <Grid item>
      <Grid container direction="column" spacing={spacing || 0}>
        <Typography variant="subtitle1" align="center">
          {caption}
        </Typography>
        <Typography variant="h3" align="center">
          {stat}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default CaptionedStat;
