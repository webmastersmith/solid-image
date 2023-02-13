#! /bin/bash

git add .
git commit -m "${@:- minor commit}"
git push