REM - build the distribution files and test
REM build_distribution.cmd
call yarn run webpack --config webpack.config.js
call yarn run test:unit
rem call yarn run generate
